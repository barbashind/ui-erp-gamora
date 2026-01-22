import { useEffect, useState } from "react"

// компоненты Consta

import { Button } from "@consta/uikit/Button"
import { Card } from "@consta/uikit/Card"
import { Layout } from "@consta/uikit/Layout"
import { Text } from "@consta/uikit/Text"



// иконки
import { SaveOutlined } from "@ant-design/icons"
import { IconAdd } from "@consta/icons/IconAdd";

// собственные компоненты
import { cnMixFontSize } from "../../utils/MixFontSize"
import { AntIcon } from "../../utils/AntIcon"
import { TextField } from "@consta/uikit/TextField"
import { IconTrash } from "@consta/icons/IconTrash"
import { cnMixSpace } from "@consta/uikit/MixSpace"
import { Select } from "@consta/uikit/Select"
import { Loader } from "@consta/uikit/Loader"
import { TUser } from "../../types/setting-types"
import { deleteUser, getUsers, updateUsers } from "../../services/SettingsService"

// сервисы


const Users = () => {

const roles : string[] = [ 'ADM', 'USR'];
        
const [users, setUsers] = useState<TUser[]>([]);

const [isLoading, setIsLoading] = useState<boolean>(true);
// Инициализация данных
useEffect(() => {
        const getUsersData = async () => {
                await getUsers((resp) => {
                        setUsers(resp.map((item : TUser) => ({
                                userId: item.userId, 
                                username: item.username, 
                                role: item.role, 
                                password: item.password
                        })))
                });
        }
        void getUsersData().then(()=>{
                setIsLoading(false);
        });
}, [])

const deleteUserData = async (id: number | undefined) => {
        setIsLoading(true);
        await deleteUser(id).then(()=>{
                const getUsersData = async () => {
                        await getUsers((resp) => {
                                setUsers(resp.map((item : TUser) => ({
                                        userId: item.userId, 
                                        username: item.username, 
                                        role: item.role, 
                                        password: item.password
                                })))
                        });
                }
                void getUsersData().then(()=>{
                        setIsLoading(false);
                });
        })
}

const updateUsersData = async (users : TUser[]) => {
        setIsLoading(true);
        await updateUsers(users).then(()=>{
                const getUsersData = async () => {
                        await getUsers((resp) => {
                                setUsers(resp.map((item : TUser) => ({
                                        userId: item.userId, 
                                        username: item.username, 
                                        role: item.role,
                                        password: item.password
                                })))
                        });
                }
                void getUsersData().then(()=>{
                        setIsLoading(false);
                });
        })
}


        return (
                <Card border style={{width: '100%'}} className={cnMixSpace({mT: 'm'})}>
                       <Layout direction="column" className={cnMixSpace({p: 'm'})}>
                                <Layout direction="row" style={{justifyContent: 'space-between', alignItems:'center'}}>
                                        <Text view="brand" size="l" weight="semibold">Пользователи</Text>
                                        <Layout direction="row">
                                                <Button
                                                        label={'Добавить'}
                                                        iconLeft={IconAdd}
                                                        view="secondary"
                                                        onClick={()=>{
                                                                setUsers(prev => 
                                                                        [...prev, {id: undefined, username: undefined}]
                                                                )
                                                        }}
                                                        size="s"
                                                        className={cnMixSpace({mR: 'm'})}
                                                />
                                                <Button
                                                        label={'Сохранить'}
                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                <SaveOutlined
                                                                className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                                />
                                                        ))}
                                                        view="primary"
                                                        size="s"
                                                        onClick={()=>{
                                                                updateUsersData(users);
                                                        }}
                                                />
                                        </Layout>
                                        
                                </Layout>
                                {!isLoading && (users?.length > 0) && (
                                <Layout direction="row" style={{justifyContent: 'space-between'}} className={cnMixSpace({mT:'m'})}>
                                        <Text style={{minWidth: '120px', maxWidth: '120px'}} className={cnMixSpace({mR:'m'})} align="left" size="xs">ID</Text>
                                        <Text style={{width: '100%'}} align="left" size="xs">Наименование</Text>
                                        <Text style={{minWidth: '200px', maxWidth: '200px'}} className={cnMixSpace({mL:'m'})} align="left" size="xs">Роль</Text>
                                        <div style={{minWidth: '40px', maxWidth: '40px'}}/>
                                </Layout>
                                )}
                                <Layout direction="column">
                                        {!isLoading && users?.map((acc : TUser) => (
                                                <Layout direction="row" className={cnMixSpace({mT: 's'})}>
                                                        <TextField
                                                                value={acc?.userId?.toString()}
                                                                size="s"
                                                                placeholder="ID"
                                                                onChange={(value)=>{
                                                                        if (value) {
                                                                            setUsers(prev => 
                                                                                prev.map(account => (users.indexOf(account) === users.indexOf(acc)) ? 
                                                                                        { ...account, 
                                                                                                id: Number(value),
                                                                                        } : account
                                                                                )
                                                                                );    
                                                                        } else {
                                                                                setUsers(prev => 
                                                                                        prev.map(account => (users.indexOf(account) === users.indexOf(acc)) ? 
                                                                                                { ...account, 
                                                                                                        id: undefined,
                                                                                                } : account
                                                                                        )
                                                                                        );   
                                                                        }
                                                                        
                                                                }}
                                                                style={{minWidth: '120px', maxWidth: '120px'}}
                                                                disabled
                                                        />
                                                        <TextField
                                                                value={acc?.username}
                                                                size="s"
                                                                style={{width: '100%'}}
                                                                placeholder="Введите наименованование"
                                                                onChange={(value)=>{
                                                                        if (value) {
                                                                                setUsers(prev => 
                                                                                prev.map(account => (users.indexOf(account) === users.indexOf(acc)) ? 
                                                                                        { ...account, 
                                                                                                username: value,
                                                                                        } : account
                                                                                )
                                                                                );    
                                                                        } else {
                                                                                setUsers(prev => 
                                                                                        prev.map(account => (users.indexOf(account) === users.indexOf(acc)) ? 
                                                                                                { ...account, 
                                                                                                        username: undefined,
                                                                                                } : account
                                                                                        )
                                                                                        );   
                                                                        }
                                                                        
                                                                }}
                                                                className={cnMixSpace({mL:'m'})}
                                                        />
                                                        <TextField
                                                                value={acc?.password}
                                                                size="s"
                                                                style={{width: '100%'}}
                                                                placeholder="Введите наименованование"
                                                                onChange={(value)=>{
                                                                        if (value) {
                                                                                setUsers(prev => 
                                                                                prev.map(account => (users.indexOf(account) === users.indexOf(acc)) ? 
                                                                                        { ...account, 
                                                                                                password: value,
                                                                                        } : account
                                                                                )
                                                                                );    
                                                                        } else {
                                                                                setUsers(prev => 
                                                                                        prev.map(account => (users.indexOf(account) === users.indexOf(acc)) ? 
                                                                                                { ...account, 
                                                                                                        password: undefined,
                                                                                                } : account
                                                                                        )
                                                                                        );   
                                                                        }
                                                                        
                                                                }}
                                                                className={cnMixSpace({mL:'m'})}
                                                        />
                                                        <Select
                                                                items={roles}
                                                                getItemLabel={item => item}
                                                                getItemKey={item => item}
                                                                value={acc?.role}
                                                                size="s"
                                                                placeholder="Выберите роль"
                                                                onChange={(value)=>{
                                                                        if (value) {
                                                                            setUsers(prev => 
                                                                                prev.map(account => (users.indexOf(account) === users.indexOf(acc)) ? 
                                                                                        { ...account, 
                                                                                                role: value,
                                                                                        } : account
                                                                                )
                                                                                );    
                                                                        } else {
                                                                                setUsers(prev => 
                                                                                        prev.map(account => (users.indexOf(account) === users.indexOf(acc)) ? 
                                                                                                { ...account, 
                                                                                                        role: undefined,
                                                                                                } : account
                                                                                        )
                                                                                        );   
                                                                        }
                                                                        
                                                                }}
                                                                style={{minWidth: '200px', maxWidth: '200px'}}
                                                                className={cnMixSpace({mL:'m'})}
                                                        />
                                                        <div style={{minWidth: '40px', maxWidth: '40px'}}>
                                                                <Button
                                                                        iconLeft={IconTrash}
                                                                        view="clear"
                                                                        size="s"
                                                                        onClick={()=>{
                                                                                if (!acc.userId) {
                                                                                        setUsers(prev => prev.filter(account => (users.indexOf(account) !== users.indexOf(acc))));  
                                                                                } else {
                                                                                        deleteUserData(acc.userId)
                                                                                }
                                                                        }}
                                                                />
                                                        </div>
                                                </Layout>
                                        ))}
                                        {!isLoading && (users?.length === 0 || !users) && (
                                                <Text 
                                                        view="secondary" 
                                                        size="s" 
                                                        weight="semibold"
                                                        className={cnMixSpace({mT:'m'})}
                                                >
                                                        Добавьте хотя бы одну запись
                                                </Text>
                                        )}
                                        {isLoading && (
                                                <Layout style={{width: '100%', height: '50px', justifyContent: 'center', alignItems: 'center'}}>
                                                        <Loader/>
                                                </Layout>
                                        )}
                                </Layout>
                       </Layout>
                </Card>
                
                
        )
}
export default Users;