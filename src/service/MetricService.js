import axios from 'axios';

export class MetricService {
    baseUrl = "http://localhost:8086/api/metrics/";

    getAll(){
        return axios.get(this.baseUrl).then(res => res.data);
    }

    get(id) {
        return axios.get(this.baseUrl +id).then(res => res.data);
    }

    save(metric) {
        return axios.post(this.baseUrl, metric).then(res => res.data);
    }

    delete(id) {
        return axios.delete(this.baseUrl +id).then(res => res.data);
    }
}