'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // 👈 必须保留这一行！

type Category = '家务' | '宝宝' | '采购' | '其他';
type Priority = '高' | '中' | '低';

interface List {
    id: string;
    name: string;
}

interface FamilyItem {
    id: number;
    title: string;
    list_id: string; // 👈 数据库里用下划线
    category: Category;
    priority: Priority;
    completed: boolean;
}

const LISTS: List[] = [
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

    // 1. 从云端获取数据
    const fetchItems = async () => {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setItems(data as FamilyItem[]);
    };

    // 2. 实时监听（全家同步的核心）
    useEffect(() => {
        fetchItems();
        const channel = supabase
            .channel('realtime-todos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => {
                fetchItems();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    // 3. 勾选同步
    const toggleItem = async (id: number, currentStatus: boolean) => {
        await supabase
            .from('todos')
            .update({ completed: !currentStatus })
            .eq('id', id);
        // 监听会自动触发 fetchItems，所以这里不需要手动 setItems
    };

    // 4. 新增同步
    const addItem = async () => {
        if (!newTitle.trim()) return;
        const { error } = await supabase.from('todos').insert([{
            title: newTitle.trim(),
            list_id: activeListId,
            category: newCategory,
            priority: '中',
            completed: false,
        }]);

        if (!error) {
            setNewTitle('');
            setNewCategory('其他');
        }
    };

    // 过滤逻辑（保持你之前的设置）
    const visibleItems = items.filter(item => {
        if (item.list_id !== activeListId) return false;
        if (activeCategory === '全部') return true;
        return item.category === activeCategory;
    });

    const activeListName = LISTS.find(l => l.id === activeListId)?.name ?? '';

    return (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
            {/* 你的精美 UI 开始 */}
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>🏠 家庭清单 (云同步)</h1>

            {/* 清单切换 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {LISTS.map(list => (
                    <button
                        key={list.id}
                        onClick={() => setActiveListId(list.id)}
                        style={{
                            padding: '6px 12px', borderRadius: 16, border: '1px solid #ccc', cursor: 'pointer',
                            backgroundColor: activeListId === list.id ? '#333' : '#fff',
                            color: activeListId === list.id ? '#fff' : '#333',
                        }}
                    >
                        {list.name}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: 8, color: '#666' }}>当前清单：<strong>{activeListName}</strong></div>

            {/* 分类筛选 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {FILTER_OPTIONS.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '4px 10px', fontSize: 13, borderRadius: 16, border: '1px solid #ccc', cursor: 'pointer',
                            backgroundColor: activeCategory === cat ? '#333' : '#fff',
                            color: activeCategory === cat ? '#fff' : '#333',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 新增输入框 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder={`添加到 ${activeListName}...`}
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    style={{ flex: 1, padding: 8, fontSize: 14, border: '1px solid #ccc', borderRadius: 4 }}
                />
                <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as Category)}
                    style={{ padding: 8, fontSize: 14, border: '1px solid #ccc', borderRadius: 4 }}
                >
                    {CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <button onClick={addItem} style={{ padding: '8px 12px', fontSize: 14, cursor: 'pointer' }}>➕ 添加</button>
            </div>

            {/* 列表渲染 */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {visibleItems.map(item => (
                    <li key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee', opacity: item.completed ? 0.5 : 1 }}>
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleItem(item.id, item.completed)} // 👈 调用云端切换
                            style={{ marginRight: 12 }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>{item.title}</div>
                            <small style={{ color: '#666' }}>{item.category} · 优先级 {item.priority}</small>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}