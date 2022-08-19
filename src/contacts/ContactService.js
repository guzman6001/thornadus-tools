import axios from 'axios';

export class ContactService {
    baseUrl = "http://localhost:8082/api/contacts/";

    getAll(){
        return axios.get(this.baseUrl).then(res => res.data);
    }

    get(id) {
        return axios.get(this.baseUrl +id).then(res => res.data);
    }

    save(contact) {
        return axios.post(this.baseUrl, contact).then(res => res.data);
    }

    delete(id) {
        return axios.delete(this.baseUrl +id).then(res => res.data);
    }
}