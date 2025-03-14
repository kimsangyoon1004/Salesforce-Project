public with sharing class LeadUpdateService {
    @AuraEnabled
    public static void updateLeadWithImageUrl(String leadId, String imageUrl) {
        if (String.isEmpty(leadId) || String.isEmpty(imageUrl)) {
            System.debug('❌ [오류] 리드 ID 또는 이미지 URL이 비어 있습니다.');
            throw new AuraHandledException('❌ 리드 ID 또는 이미지 URL이 없습니다.');
        }

        try {
            System.debug('📌 [디버깅] Lead ID: ' + leadId);
            System.debug('📌 [디버깅] 이미지 URL: ' + imageUrl);
            System.debug('📌 [디버깅] 현재 DML 사용량: ' + Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements());

            // 🔍 Lead 조회
            List<Lead> leadList = [SELECT Id, Business_Certification_Image__c FROM Lead WHERE Id = :leadId LIMIT 1];

            if (leadList.isEmpty()) {
                System.debug('❌ [쿼리 실패] 해당 리드를 찾을 수 없음: ' + leadId);
                throw new AuraHandledException('❌ 해당 ID에 대한 리드를 찾을 수 없습니다.');
            }

            Lead leadToUpdate = leadList[0];

            // ✅ Field-Level Security 체크
            if (!Schema.sObjectType.Lead.fields.Business_Certification_Image__c.isAccessible()) {
                throw new AuraHandledException('❌ Business_Certification_Image__c 필드에 대한 접근 권한이 없습니다.');
            }
            if (!Schema.sObjectType.Lead.fields.Business_Certification_Image__c.isUpdateable()) {
                throw new AuraHandledException('❌ Business_Certification_Image__c 필드 업데이트 권한이 없습니다.');
            }

            // ✅ 기존 URL과 동일하면 업데이트하지 않음
            // if (leadToUpdate.Business_Certification_Image__c == imageUrl) {
            //     System.debug('⚠️ [알림] 동일한 이미지 URL이 이미 존재하여 업데이트하지 않음.');
            //     return;
            // }

            System.debug('📌 [디버깅] 기존 URL: ' + leadToUpdate.Business_Certification_Image__c);
            System.debug('📌 [디버깅] 새 URL 업데이트 진행');

            // ✅ 리드 업데이트
            leadToUpdate.Business_Certification_Image__c = imageUrl;

            try {
                update leadToUpdate;
                System.debug('✅ [성공] 리드 업데이트 완료');
            } catch (DmlException dmlEx) {
                System.debug('❌ [DML 오류] ' + dmlEx.getMessage());
                throw new AuraHandledException('❌ Lead 업데이트 중 오류 발생 (DML Exception): ' + dmlEx.getMessage());
            }
        } catch (QueryException qe) {
            System.debug('❌ [쿼리 오류] ' + qe.getMessage());
            throw new AuraHandledException('❌ SOQL 조회 중 오류 발생: ' + qe.getMessage());
        } catch (Exception e) {
            System.debug('❌ [일반 오류] ' + e.getMessage());
            throw new AuraHandledException('❌ 예상치 못한 오류 발생: ' + e.getMessage());
        }
    }
}