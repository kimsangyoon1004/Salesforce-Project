public with sharing class FileUploaderController {
    @AuraEnabled
    public static void uploadFile(Id recordId, String fileName, String fileContent) {
        try {
            ContentVersion cv = new ContentVersion();
            cv.VersionData = EncodingUtil.base64Decode(fileContent);
            cv.Title = fileName;
            cv.PathOnClient = fileName;
            cv.FirstPublishLocationId = recordId; // Lead ID
            insert cv;

            ContentDocumentLink cdl = new ContentDocumentLink();
            cdl.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;
            cdl.LinkedEntityId = recordId; // Lead ID
            cdl.ShareType = 'V'; // Viewer permission
            cdl.Visibility = 'AllUsers';
            insert cdl;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}