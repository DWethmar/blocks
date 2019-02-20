package blocks

import "os"

func InProductionMode() bool {
	return os.Getenv("APP_ENV") == "production"
}

