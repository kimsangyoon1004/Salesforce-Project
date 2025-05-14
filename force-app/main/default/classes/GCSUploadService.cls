public with sharing class GCSUploadService {
    private static final String BUCKET_NAME = 'leadimageupload';
    @AuraEnabled
    public static String getSignedUrl(String fileName, String contentType) {
        try {
            String bucketName = 'leadimageupload';
            String method = 'PUT'; 
            
            String signedUrl = 'https://storage.googleapis.com/' + bucketName + '/' + fileName + '?signed=true&method=' + method;
            return signedUrl;
        } catch (Exception e) {
            throw new AuraHandledException('Signed URL 생성 중 오류 발생: ' + e.getMessage());
        }
    }
    
 
}