// File: src/services/transactionService.js
import axios from 'axios';

const API_URL = ' https://system-backend-rwsk.onrender.com/api/transactions';

export const getAllTransactions = () => {
    return axios.get(API_URL);
};

export const createTransaction = (transactionDto) => {
    return axios.post(API_URL, transactionDto);
};

export const getTransactionsByDateRange = (startDate, endDate) => {
    return axios.get(`${API_URL}/report`, {
        params: {
            startDate: startDate,
            endDate: endDate
        }
    });
};

export const invoiceTransaction = (id, invoiceData) => {
    return axios.put(`${API_URL}/invoice/${id}`, invoiceData);
};

export const voidTransaction = (id) => {
    return axios.put(`${API_URL}/void/${id}`);
};

export const reEnterTransaction = (id) => {
    return axios.put(`${API_URL}/re-enter/${id}`);
};