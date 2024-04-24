/*
    Global constants for AWS S3
*/
namespace s3GlobalConstants {
    export const AWS_AI_BUCKET = 'your-bucket-name';
    export const OBJECT_KEY = 'your-object-key';
    export const LOCAL_FILE_PATH_AI = './downloaded-file.zip';
    export const REGION = 'eu-central-1';
}

/*
    Credentials for AWS S3
*/
namespace s3Credentials { //todo:  move to .env file
    export const ACCESS_KEY_ID = 'your-access-key-id';
    export const SECRET_ACCESS_KEY = 'your-secret-access-key';
}