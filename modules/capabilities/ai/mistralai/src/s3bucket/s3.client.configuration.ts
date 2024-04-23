import {S3Client} from "@aws-sdk/client-s3";
import REGION = s3GlobalConstants.REGION;
import ACCESS_KEY_ID = s3Credentials.ACCESS_KEY_ID;
import SECRET_ACCESS_KEY = s3Credentials.SECRET_ACCESS_KEY;

/*
    S3 client configuration
*/
export function s3ClientConfig() {
    return new S3Client({
        region: REGION,
        credentials: {
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY
        },
        logger: console,
        maxAttempts: 3
    });
}
