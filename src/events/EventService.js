import axios from 'axios';

export class EventService {
    baseUrl = "http://localhost:8084/api/events/";

    getAll(){
        return axios.get(this.baseUrl).then(res => res.data);
    }

    get(id) {
        return axios.get(this.baseUrl +id).then(res => res.data);
    }

    save(event) {
        return axios.post(this.baseUrl, event).then(res => res.data);
    }

    delete(id) {
        return axios.delete(this.baseUrl +id).then(res => res.data);
    }
}