public with sharing class OCRFlowHandler2 {
    public class OCRResult {
        @InvocableVariable(label='Extracted Text' description='Extracted text from the OCR')
        public String extractedText;
    }

    @InvocableMethod(label='Execute OCR' description='Runs OCR on the Business Certification Image')
    public static List<OCRResult> executeOCR(List<Id> leadIds) {
        List<OCRResult> results = new List<OCRResult>();

        for (Id leadId : leadIds) {
            Lead lead = [SELECT Id, Business_Certification_Image__c FROM Lead WHERE Id = :leadId LIMIT 1];

            if (lead.Business_Certification_Image__c != null) {
                String extractedText = GoogleCloudVision.extractFilteredText(lead.Business_Certification_Image__c);

                // ✅ OCR 결과를 리드에 저장
                lead.Extracted_Text__c = extractedText;
                update lead;

                // ✅ OCR 결과를 Flow에 반환할 수 있도록 설정
                OCRResult result = new OCRResult();
                result.extractedText = extractedText;
                results.add(result);
            }
        }

        return results;
    }
}