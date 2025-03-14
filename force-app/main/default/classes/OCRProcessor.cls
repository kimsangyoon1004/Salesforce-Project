public with sharing class OCRProcessor {
    @AuraEnabled
    public static void executeOCR(List<Id> leadIds) {
        List<Lead> leadsToUpdate = new List<Lead>();

        for (Lead lead : [SELECT Id, Business_Certification_Image__c FROM Lead WHERE Id IN :leadIds]) {
            if (String.isNotBlank(lead.Business_Certification_Image__c)) {
                String ocrResult = GoogleCloudVision.extractFilteredText(lead.Business_Certification_Image__c);
                
                // OCR 결과 저장
                lead.Extracted_Text__c = ocrResult;
                leadsToUpdate.add(lead);

                System.debug('✅ OCR 실행 완료 - 리드 ID: ' + lead.Id + ', 결과: ' + ocrResult);
            } else {
                System.debug('⚠️ OCR 실행 불가 - 이미지 URL 없음 (리드 ID: ' + lead.Id + ')');
            }
        }

        if (!leadsToUpdate.isEmpty()) {
            update leadsToUpdate;
            System.debug('✅ OCR 결과가 리드에 저장됨');
        }
    }
}