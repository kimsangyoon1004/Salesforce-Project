import { LightningElement, track } from 'lwc';
import uploadFileToLead from '@salesforce/apex/LeadFileUploadController.uploadFile';

export default class businessCertificationUpload extends LightningElement {
    @track fileName = '';
    @track fileData;
    @track statusMessage = '';

    handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            this.fileName = file.name;
            const reader = new FileReader();
            reader.onload = () => {
                this.fileData = {
                    filename: file.name,
                    base64: reader.result.split(',')[1],
                    contentType: file.type
                };
            };
            reader.readAsDataURL(file);
        }
    }

    handleUpload() {
        if (!this.fileData) {
            this.statusMessage = '파일을 선택하세요.';
            return;
        }

        uploadFileToLead({ file: this.fileData })
            .then(() => {
                this.statusMessage = '파일이 성공적으로 업로드되었습니다!';
                this.fileName = '';
            })
            .catch(error => {
                this.statusMessage = '파일 업로드 실패: ' + error.body.message;
            });
    }
}
