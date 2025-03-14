import { LightningElement, track } from 'lwc';
import getAddress from '@salesforce/apex/AddressSearch.getAddress';

export default class AddressSearch extends LightningElement {
    @track address = '';
    @track postalCode = '';
    @track streetAddress = '';
    @track detailAddress = '';
    @track city = '';
    @track district = '';
    @track addressList = [];
    @track error = '';

    handleAddressChange(event) {
        this.address = event.target.value;
        this.error = '';
    }

    handleAddressSearch() {
        this.error = '';

        if (!this.address) {
            this.error = '검색어를 입력해주세요.';
            return;
        }

        this.searchAddress();
    }

    searchAddress() {
        getAddress({ address: this.address }) 
            .then(result => {
                console.log('API 응답 결과:', result);

                if (result && result.results && result.results.juso) {
                    this.addressList = [...result.results.juso]; // 배열 새로 할당
                } else {
                    this.addressList = [];
                    this.error = '검색된 주소가 없습니다.';
                }
            })
            .catch(error => {
                console.error('API 호출 오류:', error);
                this.error = '주소 검색 중 오류가 발생했습니다. ' + error.message;
                this.addressList = [];
            });
    }

    handleAddressSelect(event) {
        const target = event.currentTarget; // 정확한 div를 참조
        console.log('선택된 주소 데이터:', target.dataset);

        this.postalCode = target.dataset.postalcode || '';
        this.streetAddress = target.dataset.streetaddress || '';

        if (this.streetAddress) {
            const parts = this.streetAddress.split(' ');
            this.city = parts.length >= 2 ? parts[0] : '';
            this.district = parts.length >= 2 ? parts[1] : '';
        } else {
            this.city = '';
            this.district = '';
        }

        this.addressList = [...this.addressList]; // UI 강제 업데이트
    }

    handleDetailAddressChange(event) {
        this.detailAddress = event.target.value;
    }
}