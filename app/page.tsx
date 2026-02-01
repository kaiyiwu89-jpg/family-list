'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // 确保你创建了 lib/supabase.ts

type Category = '家务' | '宝宝' | '采购' | '其他';
type Priority = '高' | '中' | '低';

interface FamilyItem {
    id: number;
    title: string;
    list_id: string; // 数据库通常使用下划线
    category: Category;
    priority: Priority;
    completed: boolean;
}

const LISTS = [
    { id: 'walmart', name: 'Walmart' },
    { id: 'costco', name: 'Costco' },
];

const CATEGORY_OPTIONS: Category[] = ['宝宝', '家务', '采购', '其他'];
const FILTER_OPTIONS: (Category | '全部')[] = ['全部', ...CATEGORY_OPTIONS];

export default function FamilyListPage() {
    const [activeListId, setActiveListId] = useState<string>('walmart');
    const [items, setItems] = useState<FamilyItem[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState<Category>('其他');
    const [activeCategory, setActiveCategory] = useState<Category | '全部'>('全部');

    // 1. 核心：从云端获取数据
    const fetchItems = async () => {
        console.log("当前使用的 URL:", process.env.NEXT_PUBLIC_SUPABASE_URL); // 加这一行
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setItems(data as FamilyItem[]);
        if (error) console.error('获取失败:', error);
    };

    // 2. 初始化与实时监听
    useEffect(() => {
        fetchItems();

        // 实时同步：监听数据库任何变动
        const channel = supabase
            .channel('realtime-todos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => {
                fetchItems(); // 发现变动就刷新列表
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // 3. 勾选同步到云端
    const toggleItem = async (id: number, currentStatus: boolean) => {
        const { error } = await supabase
            .from('todos')
            .update({ completed: !currentStatus })
            .eq('id', id);

        if (error) alert('更新失败');
    };

    // 4. 新增同步到云端
    const addItem = async () => {
        if (!newTitle.trim()) return;

        const { error } = await supabase
            .from('todos')
            .insert([{
                title: newTitle.trim(),
                list_id: activeListId,
                category: newCategory,
                priority: '中',
                completed: false,
            }]);

        if (!error) {
            setNewTitle('');
            setNewCategory('其他');
        } else {
            alert('添加失败');
        }
    };

    // 过滤逻辑保持在客户端（响应极快）
    const visibleItems = items.filter(item => {
        if (item.list_id !== activeListId) return false;
        if (activeCategory === '全部') return true;
        return item.category === activeCategory;
    });

    return (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
            {/* UI 部分保持不变，只需确保输入框和按钮调用新的 addItem 和 toggleItem */}
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>🏠 家庭清单 (云同步)</h1>

            {/* ... 之前的 UI 代码 (清单切换、分类筛选) ... */}
            {/* 注意：在列表渲染处修改如下： */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {visibleItems.map(item => (
                    <li key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', opacity: item.completed ? 0.5 : 1 }}>
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleItem(item.id, item.completed)}
                            style={{ marginRight: 12 }}
                        />
                        <div style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                            {item.title}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}