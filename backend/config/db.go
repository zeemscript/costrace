package config

import (
	"log"

	"github.com/ikotun-dev/costrace/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDB(dbUrl string) (*gorm.DB, error) {
	log.Println("db url :", dbUrl)
	db, err := gorm.Open(postgres.Open(dbUrl), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatal("Failed to connect to database : ", err)
	}

	if err := db.AutoMigrate(&models.Trace{}); err != nil {
		log.Fatal("Failed to migrate trace model into database : ", err)
	}
	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatal("Failed to migrate user model into database : ", err)
	}

	log.Print("Database connected & migration completed successfully")
	return db, nil
}
