const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const {
    AWS_BUCKET,
    AWS_REGIONS,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY
} = require('../config');

class awsService {
    constructor() {

        AWS.config.update({
            bucket: AWS_BUCKET,
            region: AWS_REGIONS,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY,
            }
        });

        this.S3 = new AWS.S3();
    }

    async uploadPdfFile(key, result, bucket = AWS_BUCKET) {

        let params = {
            Bucket: bucket,
            Key: key,
            ACL: 'public-read',
            Body: result,
            ContentType: 'application/pdf',
        };

        let response = await this.S3.upload(params).promise();

        return response;
    }

    async deleteKey(Key, bucket = AWS_BUCKET) {
        return this.S3.deleteObject({ Bucket: bucket, Key: Key }, function (err, data) {
        });
    }

    async deleteKeys(keys) {
        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        let params = {
            Bucket: AWS_BUCKET,
            Delete: {
                Objects: keys,
                // Quiet: true
            }
        };
        const deleteObj = this.S3.deleteObjects(params, function (err, data) {
            if (err) {
                console.log('error while deleting data', err);
            } else {
                console.log('img deleted', data);
            }
        });
        return deleteObj;
    }

    async uploadUsingFilePath(uploadFileName, fileFullPath, callback) {
        const file = await fs.readFileSync(fileFullPath);

        const params = {
            Bucket: AWS_BUCKET,
            Key: uploadFileName,
            ACL: 'public-read',
            Body: file
        };

        return this.S3.putObject(params, callback);
    }

    async s3Upload(file, updatedBufferData, bucket = AWS_BUCKET, prefix) {
        let ext = path.extname(file.name);
        let key = '';
        if (typeof prefix === 'string' && prefix.length > 0)
            key = prefix + '/' + uuid.v1() + ext;
        else
            key = uuid.v1() + ext;
        let params = {
            Bucket: bucket,
            Key: key,
            ContentType: file.mimetype,
            ACL: 'public-read',
            Body: updatedBufferData,
        };

        let response = await this.S3.upload(params).promise();
        response.Location = process.env.CDN + response.Key;
        return response;

    }

    async deleteResource(Key) {
        return await this.S3.deleteObject({ Bucket: AWS_BUCKET, Key: path.basename(Key) }, function (err, data) {
            if (err) throw err;
        }).promise();
    }

    async getSignedUrl({ filename }, bucket) {
        const key = `${bucket}/${filename || ''}`;
        // Params that we use to create our signature
        const params = {
            Bucket: AWS_BUCKET,
            Expires: 3600,
            Conditions: [
                // This depicts the ACL the file will have when uploaded
                { 'acl': 'public-read-write' },
                { 'success_action_status': '201' },
                ['starts-with', '$Content-Type', ''],
                ['starts-with', `$key`, ''],
            ],
        };

        // Use the aws-sdk method to create the signature
        const res = this.S3.createPresignedPost(params);

        // Parameters taken straight from the example at
        return {
            signature: {
                'Content-Type': '',
                'acl': 'public-read-write',
                'success_action_status': '201',
                key,
                ...res.fields, // Additional fields submitted as headers to S3
            },
            postEndpoint: res.url,
        }
    }

    async listBucketItems(bucketName = AWS_BUCKET, addCount = true, prefix = '', query = {}) {
        if (typeof prefix === 'string' && prefix.length > 0) {
            prefix = prefix + '/';
        }
        let params = {
            MaxKeys: query.limit > 100 ? 100 : query.limit || 100,
            Bucket: bucketName,
            Prefix: prefix,
            ContinuationToken: query.continuationToken
        };
        let items = [];
        let response = await this.S3.listObjectsV2(params).promise();

        if (response && response.Contents && response.Contents.length > 0) {
            items = await this.generateASWObjectUrl(response.Contents, addCount, bucketName);
        }

        return {
            NextContinuationToken: response.NextContinuationToken || null,
            items
        };
    }

    async generateASWObjectUrl(itemsArray, addCountIndex, bucket = AWS_BUCKET, region = AWS_REGIONS) {

        itemsArray.forEach((item, index) => {
            let itemKey = item.Key;
            if (addCountIndex) {
                item.sNo = (index + 1);
            }
            // item.ObjectUrl = `https://${bucket}.s3.${region}.amazonaws.com/${itemKey}`;
            item.ObjectUrl = process.env.CDN + itemKey;
        });
        return itemsArray;
    }


}

const aws = new awsService();
module.exports = aws;
