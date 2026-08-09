// src/services/AccountService.js
import axios from 'axios';

const API_URL = ' https://system-backend-rwsk.onrender.com/api/accounts'; // تأكد من هذا المسار

class AccountService {
    getAllAccounts() {
        return axios.get(API_URL);
    }

    getAccountById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    createAccount(accountData) {
        return axios.post(API_URL, accountData);
    }

    updateAccount(id, accountData) {
        return axios.put(`${API_URL}/${id}`, accountData);
    }

    deleteAccount(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new AccountService();