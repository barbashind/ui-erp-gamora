import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// собственные компоненты
import { getCompanyData, getUsersData, updateCompanyData } from "../services/OraganizationService";
import { Organization, User } from "../types/organization-types";
import { AntIcon } from "../utils/AntIcon";
import { cnMixFontSize } from "../utils/MixFontSize";
import { concatUrl } from "../utils/urlUtils";
import { routeTarget } from "../routers/routes";

// иконки
import { AuditOutlined, DeleteOutlined, EditOutlined, HomeOutlined, PlusOutlined,UserOutlined,DollarOutlined, SaveOutlined, UsergroupAddOutlined } from "@ant-design/icons";

// компоненты Consta
import { TextField } from "@consta/uikit/TextField";
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { Button } from "@consta/uikit/Button";
import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { Loader } from "@consta/uikit/Loader";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import AddUsersModal from "./LoftChartPage/AddUsersModal";
import DataOrganizationModal from "./LoftChartPage/DataOrganizationModal";





const OrganizationPage = () => {

        interface Tab {
                id: number;
                label: string;
        }

        const tabs: Tab[] = [
                {
                        id: 0,
                        label: 'Основные данные',
                },
                {
                        id: 1,
                        label: 'Пользователи',
                },
        ]

        const [activeTab, setActiveTab] = useState<Tab>(tabs[0])

        const defaultData: Organization = {
                companyId: undefined,
                companyName: null,
                inn: null,
                address: null,
                contact: null,
                shortName: null
        }

        const defaultUser: User = {
                companyId: undefined,
                name: null,
                username: null,
                email: null,
                password: null,
                role: null,
                description: null,
                main: false,
        }

        const [data, setData] = useState<Organization>(defaultData)
        const [users, setUsers] = useState<User[]>([defaultUser])
        const [dataDef, setDataDef] = useState<Organization>(defaultData)
        const [isEdit, setIsEdit] = useState<boolean>(false)
        const [isLoading, setIsLoading] = useState<boolean>(true)
        const [isAddUsersModalOpen, setIsAddUsersModalOpen] = useState(false);
        const [isDataOrganizationModalOpen, setIsDataOrganizationModalOpen] = useState(false);

        useEffect(() => {
                if (activeTab.id === 0) {
                        const getCompany = async () => {
                                await getCompanyData((resp)=>{
                                        setData(resp);
                                        setDataDef(resp);
                                        setIsLoading(false);
                                })
                        }
                        void getCompany();
                }
                if (activeTab.id === 1) {
                        const getUsers = async () => {
                                await getUsersData((resp)=>{
                                        setUsers(resp);
                                        setIsLoading(false);
                                })
                        }
                        void getUsers();
                }
        }, [activeTab])



        const updateCompany = async () => {
                try {
                        await updateCompanyData(data).then((resp) => {
                                setData(resp);
                                setIsLoading(false);
                        })
                } catch (error) {
                        console.log(error);
                        setIsLoading(false);
                }
        }

        const navigate = useNavigate()

        return (
                <Layout direction="column" style={{width: '100%'}}>
                        <Layout 
                                direction="row" 
                                style={{justifyContent:'space-between', alignItems:'center'}}
                                className={cnMixSpace({pL:'2xl', pR:'4xl', pV:'m'})}
                        >
                                <Button
                                        view="clear"
                                        label={'Вернуться на главную'}
                                        size="s"
                                        onClick={()=>{
                                                navigate(concatUrl([routeTarget.main]));
                                        }}
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                <HomeOutlined
                                                        className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs', mB:'2xs'})}
                                                />
                                        ))}
                                />
                                <ChoiceGroup
                                        value={activeTab}
                                        items={tabs}
                                        name="selectTab"
                                        size="s"
                                        onChange={(value) => {
                                                setActiveTab(value);
                                                }}
                                />
                        </Layout>
                        <Layout 
                                direction='row' 
                                style={{ 
                                        minHeight: 'calc(100vh - 138px)', 
                                        gap: '32px', 
                                        paddingBottom: '32px', 
                                        paddingRight: '32px',
                                        paddingLeft: '32px',  
                                        flexWrap: 'wrap',
                                        width: '100%'

                                }}
                        >
                                <Card 
                                        style={{ 
                                                backgroundColor: 'var(--color-bg-default)', 
                                                width: '100%'
                                        }} 
                                        className={cnMixSpace({pL:'l', pT:'l', pR:'m', pB:'m'})}
                                >
                                        <Layout direction="column">
                                                

                                                <Layout direction="row" style={{justifyContent:'space-between', alignItems:'center'}} className={cnMixSpace({ mL:'2xl'})}>
                                                        {(activeTab.id === 0) && (
                                                                <Layout direction="row" style={{alignItems:'center'}} >
                                                                        <AuditOutlined style={{ fontSize: '2em', color: 'var(--color-blue-ui)'}} />
                                                                        <Text size="xl" weight='semibold' style={{color: 'var(--color-blue-ui)'}} className={cnMixSpace({mL:'m'})} >Основные данные</Text>
                                                                </Layout>
                                                        )}
                                                        {(activeTab.id === 1) && (
                                                                <Layout direction="row" style={{alignItems:'center'}} >
                                                                        <UsergroupAddOutlined style={{ fontSize: '2em', color: 'var(--color-blue-ui)'}} />
                                                                        <Text size="xl" weight='semibold' style={{color: 'var(--color-blue-ui)'}} className={cnMixSpace({mL:'m'})} onClick={()=>console.log(users)}>Список пользователей</Text>
                                                                </Layout>
                                                        )}
                                                </Layout>
                                                {!isLoading && (activeTab.id === 0) && (
                                                        <Layout direction="column" className={cnMixSpace({mT:'xl', mL:'xl'})}>
                                                                <Layout direction="column" className={cnMixSpace({mT:'m'})}>
                                                                        <Text size="s" >Наименование организации:</Text>
                                                                        <TextField
                                                                                value={data.companyName}
                                                                                onChange={(value) => {
                                                                                        setData(prev => ({...prev, companyName: value}))
                                                                                }}
                                                                                size="s"
                                                                                style={{maxWidth: '450px'}}
                                                                                className={cnMixSpace({mT:'2xs'})}
                                                                                placeholder={!isEdit ? '-' : "Введите наименование организации"}
                                                                                type="textarea"
                                                                                maxRows={3}
                                                                                disabled={!isEdit}
                                                                        />
                                                                </Layout>
                                                                <Layout direction="column" className={cnMixSpace({mT:'m'})}>
                                                                        <Text size="s">Краткое наименование:</Text>
                                                                        <TextField
                                                                                value={data.shortName}
                                                                                onChange={(value) => {
                                                                                        setData(prev => ({...prev, shortName: value}))
                                                                                }}
                                                                                size="s"
                                                                                style={{maxWidth: '450px'}}
                                                                                className={cnMixSpace({mT:'2xs'})}
                                                                                placeholder={!isEdit ? '-' : "Введите краткое наименование организации"}
                                                                                disabled={!isEdit}
                                                                        />
                                                                </Layout>
                                                                <Layout direction="column" className={cnMixSpace({mT:'m'})}>
                                                                        <Text size="s">ИНН:</Text>
                                                                        <TextField
                                                                                value={data.inn}
                                                                                onChange={(value) => {
                                                                                        setData(prev => ({...prev, inn: value}))
                                                                                }}
                                                                                size="s"
                                                                                style={{maxWidth: '450px'}}
                                                                                className={cnMixSpace({mT:'2xs'})}
                                                                                placeholder={!isEdit ? '-' : "Введите ИНН организации"}
                                                                                disabled={!isEdit}
                                                                        />
                                                                </Layout>
                                                                <Layout direction="column" className={cnMixSpace({mT:'m'})}>
                                                                        <Text size="s">Контактный номер:</Text>
                                                                        <TextField
                                                                                value={data.contact}
                                                                                onChange={(value) => {
                                                                                        setData(prev => ({...prev, contact: value}))
                                                                                }}
                                                                                size="s"
                                                                                style={{maxWidth: '450px'}}
                                                                                className={cnMixSpace({mT:'2xs'})}
                                                                                placeholder={!isEdit ? '-' : "Введите контактный номер"}
                                                                                disabled={!isEdit}
                                                                        />
                                                                </Layout>
                                                                <Layout direction="column" className={cnMixSpace({mT:'m'})}>
                                                                        <Text size="s">Юр. адрес:</Text>
                                                                        <TextField
                                                                                value={data.address}
                                                                                onChange={(value) => {
                                                                                        setData(prev => ({...prev, address: value}))
                                                                                }}
                                                                                size="s"
                                                                                style={{maxWidth: '450px'}}
                                                                                className={cnMixSpace({mT:'2xs'})}
                                                                                placeholder={!isEdit ? '-' : "Введите юридический адрес"} 
                                                                                type="textarea"
                                                                                maxRows={4}
                                                                                disabled={!isEdit}
                                                                        />
                                                                </Layout>
                                                                <Layout direction="row" style={{justifyContent:'left', alignItems:'center'}} className={cnMixSpace({mT:'xl'})} >
                                                                                {!isEdit && (
                                                                                        <Button
                                                                                                label={'Редактировать'}
                                                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                                                        <EditOutlined
                                                                                                                className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'xs'})}
                                                                                                        />
                                                                                                ))}
                                                                                                size="s"
                                                                                                onClick={()=>{setIsEdit(true);}}
                                                                                        />
                                                                                )}
                                                                                {isEdit && (
                                                                                        <>
                                                                                                <Button
                                                                                                        label={'Отменить'}
                                                                                                        view="secondary"
                                                                                                        size="s"
                                                                                                        className={cnMixSpace({mR:'m'})}
                                                                                                        onClick={()=>{
                                                                                                                setIsEdit(false);
                                                                                                                setData(dataDef);
                                                                                                        }}
                                                                                                />
                                                                                                <Button
                                                                                                        label={'Сохранить'}
                                                                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                                                                <SaveOutlined
                                                                                                                        className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'xs'})}
                                                                                                                />
                                                                                                        ))}
                                                                                                        view="primary"
                                                                                                        size="s"
                                                                                                        onClick={()=>{
                                                                                                                setIsEdit(false);
                                                                                                                setIsLoading(true);
                                                                                                                updateCompany();
                                                                                                        }}
                                                                                                />
                                                                                                <Button
                                                                                                        label={'Добавить'}
                                                                                                        view="primary"
                                                                                                        size="s"
                                                                                                        onClick={()=>{setIsDataOrganizationModalOpen(true)
                                                                                                                
                                                                                                        }}
                                                                                                />
                                                                                        </>
                                                                                )}
                                                                                
                                                                                
                                                                
                                                                </Layout>
                                                        </Layout>
                                                )}

                                                {!isLoading && (activeTab.id === 1) && (
                                                        <Layout direction="column" style={{width: 'fit-content'}} className={cnMixSpace({mT:'xl', mL:'xl'})}>
                                                                {(users && users.length > 0) && users.map((user) => (
                                                                        <Card border style={{height:'100%', width: 'fit-content'}} className={cnMixSpace({pH:'xl', pV:'s'})}>
                                                                                <Layout direction="row" style={{alignItems: 'center', gap: '32px'}}>
                                                                                        <Text size="m" weight="semibold">{user.username}</Text>
                                                                                        <Text size="m" weight="regular" view="secondary">{user.description}</Text>
                                                                                        <Text size="m" weight="regular" view="secondary">{user.email}</Text>
                                                                                        <Layout direction="row">
                                                                                               <Button
                                                                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                                                                <EditOutlined
                                                                                                                        className={cnMixFontSize('l')}
                                                                                                                />
                                                                                                        ))}
                                                                                                        onClick={()=>{}}
                                                                                                        size="s"
                                                                                                        view="secondary"
                                                                                                        className={cnMixSpace({mR:'m'})}
                                                                                                />
                                                                                                <Button
                                                                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                                                                <DeleteOutlined
                                                                                                                        className={cnMixFontSize('l')}
                                                                                                                />
                                                                                                        ))}
                                                                                                        onClick={()=>{}}
                                                                                                        size="s"
                                                                                                        view="secondary"
                                                                                                        style={{ color:'var(--color-typo-alert)', borderColor: 'var(--color-typo-alert)' }}
                                                                                                /> 
                                                                                        </Layout>
                                                                                        
                                                                                </Layout>
                                                                        </Card>
                                                                ))}
                                                                <Layout direction="row" style={{justifyContent: 'center'}}>
                                                                        <Button 
                                                                                label={'Добавить еще'}
                                                                                onClick={()=>{setIsAddUsersModalOpen(true)}}
                                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                                        <PlusOutlined
                                                                                                className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'xs'})}
                                                                                        />
                                                                                ))}
                                                                                size="s"
                                                                                view="secondary"
                                                                                className={cnMixSpace({mT:'l'})}
                                                                        />
                                                                </Layout>
                                                                
                                                        </Layout>
                                                )} 

                                                {isLoading && (
                                                        <Layout style={{minHeight: 'calc(100vh - 328px)', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                                                <Loader size="m" />
                                                        </Layout>
                                                )}

                                        </Layout>
                                </Card>
                                <AddUsersModal
                            isModalOpen={isAddUsersModalOpen}
                            setIsModalOpen={setIsAddUsersModalOpen}
                            
                        />
                        <DataOrganizationModal
                            isModalOpen={isDataOrganizationModalOpen}
                            setIsModalOpen={setIsDataOrganizationModalOpen}
                            
                        />
                                
                        </Layout>
                </Layout>
        );
};
export default OrganizationPage;