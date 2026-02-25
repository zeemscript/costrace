package teams

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/services/email"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type TeamHandler struct {
	db *gorm.DB
}

func NewTeamHandler(db *gorm.DB) *TeamHandler {
	return &TeamHandler{db: db}
}

// CreateTeam creates a new team. The user must not already be in a team.
func (h *TeamHandler) CreateTeam(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	// Plan restriction: only Pro users can create teams
	if user.Plan == models.Free {
		shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "Team creation requires a Pro plan. You can still join teams via invitation."})
		return
	}

	//fetch user's teams
	userTeams, err := h.GetUserTeams(user.ID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch user teams"})
		return
	}

	if len(userTeams) > 0 {
		//we check if the user is an owner of any
		for _, team := range userTeams {
			if team.OwnerID == user.ID {
				shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "You are already in a team"})
				return
			}
		}
	}

	var body struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Team name is required"})
		return
	}

	team := models.Team{
		Name:    body.Name,
		OwnerID: user.ID,
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&team).Error; err != nil {
			return err
		}

		member := models.TeamMember{
			TeamID: team.ID,
			UserID: user.ID,
			Role:   "owner",
		}
		if err := tx.Create(&member).Error; err != nil {
			return err
		}

		return tx.Model(user).Association("Teams").Append(&team)
	})

	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create team"})
		return
	}

	shared.RespondJSON(w, http.StatusCreated, team)
}

type CurrentTeamResponse struct {
	Team        models.Team             `json:"team"`
	Members     []models.TeamMember     `json:"members"`
	Invitations []models.TeamInvitation `json:"invitations"`
	Role        string                  `json:"role"`
}

// GetCurrentTeam returns the current user's team info, members, and pending invites.
func (h *TeamHandler) GetCurrentTeam(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	idQueryParam := r.URL.Query().Get("id")
	if idQueryParam == "" {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Missing team ID"})
		return
	}
	parsedId, err := strconv.ParseUint(idQueryParam, 10, 64)
	if err != nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid team ID"})
		return
	}

	userTeams, err := h.GetUserTeams(user.ID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to get user teams"})
		return
	}

	teamId := uint(parsedId)
	var validTeam bool = false
	var idx int
	var team models.Team

	for idx, team = range userTeams {
		if team.ID == teamId {
			validTeam = true
			break
		}
	}

	if !validTeam {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Team not found"})
		return
	}

	requestedTeam := userTeams[idx]

	var members []models.TeamMember
	h.db.Where("team_id = ?", requestedTeam.ID).Preload("User").Find(&members)

	var invitations []models.TeamInvitation
	h.db.Where("team_id = ? AND status = ?", requestedTeam.ID, "pending").Find(&invitations)

	// Determine current user's role
	role := "member"
	if requestedTeam.OwnerID == user.ID {
		role = "owner"
	}

	shared.RespondJSON(w, http.StatusOK, CurrentTeamResponse{
		Team:        requestedTeam,
		Members:     members,
		Invitations: invitations,
		Role:        role,
	})
}

// UpdateTeam updates the team name (owner only).
func (h *TeamHandler) UpdateTeam(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" || body.ID == 0 {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Team ID and name are required"})
		return
	}

	userTeams, err := h.GetUserTeams(user.ID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to get user teams"})
		return
	}

	var team *models.Team
	for _, t := range userTeams {
		if t.ID == body.ID {
			team = &t
			break
		}
	}

	if team == nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Team not found"})
		return
	}

	if team.OwnerID != user.ID {
		shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "Only the team owner can update the team"})
		return
	}

	team.Name = body.Name
	h.db.Save(&team)

	shared.RespondJSON(w, http.StatusOK, team)
}

// DeleteTeam deletes the team. All members return to personal mode (owner only).
func (h *TeamHandler) DeleteTeam(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		ID uint `json:"id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.ID == 0 {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Team ID is required"})
		return
	}

	userTeams, err := h.GetUserTeams(user.ID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to get user teams"})
		return
	}

	var team *models.Team
	for _, t := range userTeams {
		if t.ID == body.ID {
			team = &t
			break
		}
	}

	if team == nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Team not found"})
		return
	}

	if team.OwnerID != user.ID {
		shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "Only the team owner can delete the team"})
		return
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		// Remove team association from all users
		var teamMembers []models.TeamMember
		tx.Where("team_id = ?", team.ID).Find(&teamMembers)
		for _, member := range teamMembers {
			var u models.User
			if err := tx.First(&u, member.UserID).Error; err == nil {
				tx.Model(&u).Association("Teams").Delete(team)
			}
		}

		// Delete all team members
		tx.Where("team_id = ?", team.ID).Delete(&models.TeamMember{})

		// Delete all pending invitations
		tx.Where("team_id = ?", team.ID).Delete(&models.TeamInvitation{})

		// Delete the team
		return tx.Delete(&team).Error
	})

	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete team"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

// InviteMember sends an invitation email (owner only).
func (h *TeamHandler) InviteMember(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		TeamID uint   `json:"team_id"`
		Email  string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" || body.TeamID == 0 {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Team ID and email are required"})
		return
	}

	userTeams, err := h.GetUserTeams(user.ID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to get user teams"})
		return
	}

	var team *models.Team
	for _, t := range userTeams {
		if t.ID == body.TeamID {
			team = &t
			break
		}
	}

	if team == nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Team not found"})
		return
	}

	if team.OwnerID != user.ID {
		shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "Only the team owner can invite members"})
		return
	}

	// Check if already a team member
	var existingMember models.TeamMember
	var existingUser models.User
	h.db.Where("email = ?", body.Email).First(&existingUser)
	if existingUser.ID != 0 {
		if err := h.db.Where("team_id = ? AND user_id = ?", team.ID, existingUser.ID).First(&existingMember).Error; err == nil {
			shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "User is already a team member"})
			return
		}
	}

	// Check for existing pending invitation
	var existingInvite models.TeamInvitation
	if err := h.db.Where("team_id = ? AND email = ? AND status = ?", team.ID, body.Email, "pending").First(&existingInvite).Error; err == nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "An invitation has already been sent to this email"})
		return
	}

	token := generateToken()
	invitation := models.TeamInvitation{
		TeamID:    team.ID,
		Email:     body.Email,
		Token:     token,
		Status:    "pending",
		InvitedBy: user.ID,
		ExpiresAt: time.Now().AddDate(0, 0, 7),
	}

	if err := h.db.Create(&invitation).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create invitation"})
		return
	}

	// Send invitation email (non-blocking)
	go email.SendTeamInvitation(body.Email, team.Name, user.Username, token)

	shared.RespondJSON(w, http.StatusCreated, invitation)
}

// ListInvitations lists pending invitations (owner only).
func (h *TeamHandler) ListInvitations(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		TeamID uint `json:"team_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.TeamID == 0 {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Team ID is required"})
		return
	}

	userTeams, err := h.GetUserTeams(user.ID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to get user teams"})
		return
	}

	var team *models.Team
	for _, t := range userTeams {
		if t.ID == body.TeamID {
			team = &t
			break
		}
	}

	if team == nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Team not found"})
		return
	}

	if team.OwnerID != user.ID {
		shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "Only the team owner can view invitations"})
		return
	}

	var invitations []models.TeamInvitation
	h.db.Where("team_id = ? AND status = ?", team.ID, "pending").Order("created_at desc").Find(&invitations)

	shared.RespondJSON(w, http.StatusOK, invitations)
}

// CancelInvitation cancels a pending invitation (owner only).
func (h *TeamHandler) CancelInvitation(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		TeamID uint `json:"team_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.TeamID == 0 {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Team ID is required"})
		return
	}

	userTeams, err := h.GetUserTeams(user.ID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to get user teams"})
		return
	}

	var team *models.Team
	for _, t := range userTeams {
		if t.ID == body.TeamID {
			team = &t
			break
		}
	}

	if team == nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Team not found"})
		return
	}

	if team.OwnerID != user.ID {
		shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "Only the team owner can cancel invitations"})
		return
	}

	id := chi.URLParam(r, "id")
	result := h.db.Where("id = ? AND team_id = ? AND status = ?", id, team.ID, "pending").Delete(&models.TeamInvitation{})
	if result.RowsAffected == 0 {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Invitation not found"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "cancelled"})
}

// MyInvitations lists pending invitations addressed to the current user's email.
func (h *TeamHandler) MyInvitations(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	if user.Email == "" {
		shared.RespondJSON(w, http.StatusOK, []models.TeamInvitation{})
		return
	}

	var invitations []models.TeamInvitation
	h.db.Where("email = ? AND status = ?", user.Email, "pending").
		Preload("Team").
		Order("created_at desc").
		Find(&invitations)

	// Filter out expired invitations
	var active []models.TeamInvitation
	for _, inv := range invitations {
		if time.Now().Before(inv.ExpiresAt) {
			active = append(active, inv)
		}
	}

	if active == nil {
		active = []models.TeamInvitation{}
	}

	shared.RespondJSON(w, http.StatusOK, active)
}

// AcceptInvitation accepts an invitation via token.
func (h *TeamHandler) AcceptInvitation(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	token := chi.URLParam(r, "token")

	var invitation models.TeamInvitation
	if err := h.db.Where("token = ? AND status = ?", token, "pending").First(&invitation).Error; err != nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Invitation not found or already used"})
		return
	}

	if time.Now().After(invitation.ExpiresAt) {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invitation has expired"})
		return
	}

	var team models.Team
	if err := h.db.First(&team, invitation.TeamID).Error; err != nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Team not found"})
		return
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		invitation.Status = "accepted"
		if err := tx.Save(&invitation).Error; err != nil {
			return err
		}

		member := models.TeamMember{
			TeamID: invitation.TeamID,
			UserID: user.ID,
			Role:   "member",
		}
		if err := tx.Create(&member).Error; err != nil {
			return err
		}

		return tx.Model(user).Association("Teams").Append(&team)
	})

	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to accept invitation"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "accepted"})
}

// DeclineInvitation declines an invitation via token.
func (h *TeamHandler) DeclineInvitation(w http.ResponseWriter, r *http.Request) {
	_, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	token := chi.URLParam(r, "token")

	var invitation models.TeamInvitation
	if err := h.db.Where("token = ? AND status = ?", token, "pending").First(&invitation).Error; err != nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Invitation not found or already used"})
		return
	}

	invitation.Status = "declined"
	h.db.Save(&invitation)

	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "declined"})
}

// RemoveMember removes a member from the team (owner only).
func (h *TeamHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		TeamID uint `json:"team_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.TeamID == 0 {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Team ID is required"})
		return
	}

	userTeams, err := h.GetUserTeams(user.ID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to get user teams"})
		return
	}

	var team *models.Team
	for _, t := range userTeams {
		if t.ID == body.TeamID {
			team = &t
			break
		}
	}

	if team == nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Team not found"})
		return
	}

	if team.OwnerID != user.ID {
		shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "Only the team owner can remove members"})
		return
	}

	memberID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid member ID"})
		return
	}

	if uint(memberID) == user.ID {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Owner cannot remove themselves. Delete the team instead."})
		return
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		result := tx.Where("team_id = ? AND user_id = ?", team.ID, memberID).Delete(&models.TeamMember{})
		if result.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}
		var memberUser models.User
		if err := tx.First(&memberUser, memberID).Error; err == nil {
			tx.Model(&memberUser).Association("Teams").Delete(team)
		}
		return nil
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Member not found"})
			return
		}
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to remove member"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "removed"})
}

// LeaveTeam allows a member (not owner) to leave the team.
func (h *TeamHandler) LeaveTeam(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		TeamID uint `json:"team_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.TeamID == 0 {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Team ID is required"})
		return
	}

	userTeams, err := h.GetUserTeams(user.ID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to get user teams"})
		return
	}

	var team *models.Team
	for _, t := range userTeams {
		if t.ID == body.TeamID {
			team = &t
			break
		}
	}

	if team == nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Team not found"})
		return
	}

	if team.OwnerID == user.ID {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Team owner cannot leave. Transfer ownership or delete the team."})
		return
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		tx.Where("team_id = ? AND user_id = ?", team.ID, user.ID).Delete(&models.TeamMember{})
		return tx.Model(user).Association("Teams").Delete(team)
	})

	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to leave team"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "left"})
}

func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func (h *TeamHandler) GetUserTeams(userId uint) ([]models.Team, error) {
	var teams []models.Team
	err := h.db.Model(&models.User{ID: userId}).Association("Teams").Find(&teams)
	return teams, err
}
