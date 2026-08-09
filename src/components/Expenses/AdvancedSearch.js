// src/components/Expenses/AdvancedSearch.js
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const AdvancedSearch = ({ onSearch, initialFilters }) => {
    const [searchFilters, setSearchFilters] = useState(initialFilters);

    useEffect(() => {
        setSearchFilters(initialFilters);
    }, [initialFilters]);

    const handleSearch = () => {
        if (searchFilters.startDate && searchFilters.endDate) {
            onSearch(searchFilters);
        } else {
            alert('يجب تحديد تاريخي البدء والانتهاء للبحث.');
        }
    };

    const handleReset = () => {
        const defaultFilters = { startDate: '', endDate: '', category: '' };
        setSearchFilters(defaultFilters);
        onSearch(defaultFilters);
    };

    return (
        <Box
            component="div"
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                bgcolor: '#fafafa'
            }}
        >
            <Typography variant="h6" component="h2" sx={{ mr: 2 }}>
                بحث متقدم
            </Typography>
            <TextField
                label="من تاريخ"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={searchFilters.startDate || ''}
                onChange={(e) => setSearchFilters({ ...searchFilters, startDate: e.target.value })}
            />
            <TextField
                label="إلى تاريخ"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={searchFilters.endDate || ''}
                onChange={(e) => setSearchFilters({ ...searchFilters, endDate: e.target.value })}
            />
            <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
            >
                بحث
            </Button>
            <Button
                variant="outlined"
                onClick={handleReset}
                startIcon={<ClearIcon />}
            >
                إلغاء البحث
            </Button>
        </Box>
    );
};

export default AdvancedSearch;