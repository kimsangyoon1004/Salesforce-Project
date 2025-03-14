public with sharing class ContractUploadController {
    @AuraEnabled
    public static void updateLeadWithContractImage(String leadId, String fileUrl) {
        if (String.isEmpty(leadId) || String.isEmpty(fileUrl)) {
            throw new AuraHandledException('❌ 리드 ID 또는 이미지 URL이 없습니다.');
        }

        try {
            // ✅ 정확한 필드를 업데이트하는지 확인
            Lead leadToUpdate = [SELECT Id, Contract__c FROM Lead WHERE Id = :leadId LIMIT 1];
            leadToUpdate.Contract__c = fileUrl; // ✅ Contract__c 필드 업데이트
            update leadToUpdate;
        } catch (Exception e) {
            throw new AuraHandledException('❌ 리드 업데이트 실패: ' + e.getMessage());
        }
    }
}