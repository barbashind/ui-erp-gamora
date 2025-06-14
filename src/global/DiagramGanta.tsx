import { Layout } from '@consta/uikit/Layout';
import { Text } from '@consta/uikit/Text';
import React from 'react';

export interface Task {
    name: string;
    startDate: Date; // ISO формат времени
    endDate: Date;   // ISO формат времени
}

interface DiagramGantaProps {
    startPeriod: Date;
    endPeriod: Date;
    tasks: Task[];
}

const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD',
    '#E67E22', '#2ECC71', '#3498DB', '#9B59B6', '#1ABC9C',
    '#34495E', '#16A085', '#2980B9', '#D35400', '#C0392B',
];

export const DiagramGanta: React.FC<DiagramGantaProps> = ({ startPeriod, endPeriod, tasks }) => {
    const uniqueNames = Array.from(new Set(tasks.map(task => task.name)));

    interface TaskWithColor {
        name: string;
        color: string;
    }

    const taskWithColor: TaskWithColor[] = uniqueNames.map((el, index) => ({
        name: el,
        color: colors[index % colors.length] // Используем остаток от деления для выбора цвета
    }));

    // Генерация периодов по часам
    const periods: string[] = [];
    const current = new Date(startPeriod);
    while (current <= endPeriod) {
        periods.push(current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        current.setHours(current.getHours() + 1); // Увеличиваем на 1 час
    }

    return (
        <Layout direction='column'>
            {taskWithColor.map((elem) => (
                <Layout direction='row' key={elem.name}>
                    {tasks.filter(el => el.name === elem.name).map(task => (
                        <Layout
                            key={task.startDate.toString()}
                            style={{
                                minHeight: '20px',
                                minWidth: '100px',
                                justifyContent: 'center',
                                backgroundColor: elem.color,
                                borderRadius: '10px',
                                marginRight: '5px'
                            }}
                        >
                            <Text size='s'>{task.name}</Text>
                        </Layout>
                    ))}
                </Layout>
            ))}
            <div style={{ width: '100%', borderBottom: '1px solid' }} />
            <Layout direction='row' style={{ justifyContent: 'space-between' }}>
                {periods.map((period, index) => (
                    <div key={index} style={{ textAlign: 'center' }}>
                        <div style={{ borderLeft: '1px dashed black', height: '20px' }} />
                        <Text size='s'>{period}</Text>
                    </div>
                ))}
            </Layout>
        </Layout>
    );
};