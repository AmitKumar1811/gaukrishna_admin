import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
 
const IDENTITY_POOL_ID =  "us-east-1:ed5ef244-e831-42f0-b29f-35ca71301cf8";
const REGION ="us-east-1";
const BUCKET = "statmeb";

 
 

console.log("Region:",REGION);
console.log("Bucket:",BUCKET);    
console.log("Identity Pool ID:",IDENTITY_POOL_ID);
if (!REGION || !BUCKET || !IDENTITY_POOL_ID) {
  throw new Error("AWS S3 environment variables are not set");
}
 
const s3Client = new S3Client({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: REGION },
    identityPoolId: IDENTITY_POOL_ID,
  }),
});
 
export async function uploadFileToS3(file,key) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer); // ✅ fix for TS
 
    const params = {
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: file.type,
      ACL: "public-read"
    };
 
    await s3Client.send(new PutObjectCommand(params));
 
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  } catch (err) {
    console.error("S3 upload error:", err);
    throw new Error("Failed to upload to S3");
  }
}