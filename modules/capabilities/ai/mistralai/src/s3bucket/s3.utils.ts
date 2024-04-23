import {GetObjectCommand, GetObjectOutput} from "@aws-sdk/client-s3";
import { createWriteStream, WriteStream } from "fs";
import {s3ClientConfig} from "./s3.client.configuration";


// Initialize S3 client
const s3Client = s3ClientConfig();

// Constant for the size of one MB in bytes
const oneMB: number = 1024 * 1024;

// Function to get a range of bytes from an object in an S3 bucket
export const getObjectRange = async ({
                                         bucket,
                                         key,
                                         start,
                                         end,
                                     }: {
    bucket: string;
    key: string;
    start: number;
    end: number;
}): Promise<GetObjectOutput> => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        Range: `bytes=${start}-${end}`,
    });

    return s3Client.send(command);
};

// Function to parse the content range header from the response
export const getRangeAndLength = (contentRange: string): { start: number; end: number; length: number } => {
    const [range, length] = contentRange.split("/");
    const [_, start, end] = range.split("-");

    return {
        start: parseInt(start),
        end: parseInt(end),
        length: parseInt(length),
    };
};

// Function to check if the entire file has been downloaded
export const isComplete = ({ end, length }: { end: number; length: number }): boolean => {
    return end === length - 1;
};

// Function to download a file in chunks
export const downloadInChunks = async ({ bucket, key }: { bucket: string; key: string }): Promise<void> => {
    const writeStream: WriteStream = createWriteStream(key) // Simplified file path
        .on("error", (err) => console.error("Write stream error:", err));

    let rangeAndLength = { start: -1, end: -1, length: -1 };

    while (!isComplete(rangeAndLength)) {
        const { end } = rangeAndLength;
        const nextRange = { start: end + 1, end: end + oneMB };

        console.log(`Downloading bytes ${nextRange.start} to ${nextRange.end}`);

        const response = await getObjectRange({
            bucket,
            key,
            ...nextRange,
        });

        if (response.Body) {
            writeStream.write(await new Response(response.Body as Blob).arrayBuffer());
        }

        if (response.ContentRange) {
            rangeAndLength = getRangeAndLength(response.ContentRange);
        }
    }

    writeStream.end();
    console.log('Download complete');
};

//! Usage
// await downloadInChunks({
//     bucket: AWS_AI_BUCKET,
//     key: OBJECT_KEY,
// });
//
