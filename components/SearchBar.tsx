import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Buscar alimentos por nombre o marca...',
}) => {
    const [query, setQuery] = useState('');
    const lastSearch = useRef(query);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query !== lastSearch.current) {
                onSearch(query);
                lastSearch.current = query;
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [query, onSearch]);

    const handleClear = () => {
        setQuery('');
        if (lastSearch.current !== '') {
            onSearch('');
            lastSearch.current = '';
        }
    };

    return (
        <View className="flex-row items-center bg-gray-100 dark:bg-zinc-900 rounded-full px-4 py-2 border border-gray-200 dark:border-zinc-800 focus:border-green-500">
            <Search size={20} color="#9ca3af" className="mr-2" />
            <TextInput
                className="flex-1 text-base text-black dark:text-white pb-1 pt-1" // Extra padding fix for alignment
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
            />
            {query.length > 0 && (
                <TouchableOpacity onPress={handleClear} className="p-1 rounded-full bg-gray-200 dark:bg-zinc-700 ml-2">
                    <X size={14} color="#6b7280" />
                </TouchableOpacity>
            )}
        </View>
    );
};
