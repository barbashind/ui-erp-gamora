import { useState } from 'react';

// компоненты Consta
import { Text } from '@consta/uikit/Text';
import { Layout } from '@consta/uikit/Layout';
import { TextField } from '@consta/uikit/TextField';
import { Button } from '@consta/uikit/Button';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Card } from '@consta/uikit/Card';
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, LeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { Organization, User } from './types/organization-types';
import { Modal } from '@consta/uikit/Modal';
import { AntIcon } from './utils/AntIcon';
import { cnMixFontSize } from './utils/MixFontSize';

export interface TRegistrationModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RegistrationModal = ({isModalOpen, setIsModalOpen} : TRegistrationModalProps) => {
    const [username, setUsername] = useState('');
    const [NHPassword, setNHPassword] = useState('');
    const [NHPassword2, setNHPassword2] = useState('');
    const [email, setEmail] = useState('');

    const defaultData: Organization = {
                  companyId: undefined,
                  companyName: null,
                  inn: null,
                  address: null,
                  contact: null,
                  shortName: null
          }

    const [data, setData] = useState<Organization>(defaultData);
    type Step = {
        id: number,
        label: string,
    }
    const  steps : Step[] = [
      {
        id: 0,
        label: 'Данные администратора'
      },
      {
        id: 1,
        label: 'Данные организации'
      },
      {
        id: 2,
        label: 'Добавление пользователей'
      },
    ];

    const [step, setStep] = useState<Step>(steps[0]);

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

    const [users, setUsers] = useState<User[]>([defaultUser])
    

    return (
              <Modal
                      isOpen={isModalOpen}
                      hasOverlay={false}
                      onEsc={() => {
                              setIsModalOpen(false);
                      }}
                      style={{maxWidth: '500px', minWidth: '350px'}}
              >
                <Card className={cnMixSpace({p: 'xl'})} style={{ alignSelf: 'center'}}>

                  <Text size='xl' style={{color: 'var(--color-blue-ui)', width: '100%'}} align='center' >Регистрация бизнес-аккаунта</Text>

                  {step.id === 0 && (
                    <Card border className={cnMixSpace({p: 'l', mT:'xl'})}>
                          <Layout direction="column" className={cnMixSpace({mT:'m'})}>
                          
                                <Text size="m">E-mail:</Text>
                                <TextField
                                        value={email}
                                        onChange={(value) => {
                                          if (value) {
                                              setEmail(value);
                                          } else {
                                            setEmail('');
                                          }
                                        }}
                                        size="m"
                                        style={{maxWidth: '450px', minWidth: '350px'}}
                                        className={cnMixSpace({mT:'2xs'})}
                                        placeholder={"Введите эл. адрес"}
                                />
                        </Layout>
                        <Layout direction="column" className={cnMixSpace({mT:'m'})}>
                          
                                <Text size="m">Номер телефона:</Text>
                                <TextField
                                        value={username}
                                        onChange={(value) => {
                                          if (value) {
                                              setUsername(value);
                                          } else {
                                            setUsername('');
                                          }
                                        }}
                                        size="m"
                                        style={{maxWidth: '450px', minWidth: '350px'}}
                                        className={cnMixSpace({mT:'2xs'})}
                                        placeholder={"Введите контактный номер"}
                                />
                        </Layout>
                        <Layout direction="column" className={cnMixSpace({mT:'m'})}>
                                <Text size="m">Введите пароль:</Text>
                                <TextField
                                        value={NHPassword}
                                        type={'password'}
                                        onChange={(value) => {
                                          if (value) {
                                              setNHPassword(value);
                                          } else {
                                            setNHPassword('');
                                          }
                                        }}
                                        size="m"
                                        style={{maxWidth: '450px', minWidth: '350px'}}
                                        className={cnMixSpace({mT:'2xs'})}
                                        placeholder={"Введите пароль"}
                                />
                        </Layout>
                        <Layout direction="column" className={cnMixSpace({mT:'m'})}>
                                <Text size="m">Подтвердите пароль:</Text>
                                <TextField
                                        value={NHPassword2}
                                        type={'password'}
                                        onChange={(value) => {
                                          if (value) {
                                              setNHPassword2(value);
                                          } else {
                                            setNHPassword2('');
                                          }
                                        }}
                                        size="m"
                                        style={{maxWidth: '450px', minWidth: '350px'}}
                                        className={cnMixSpace({mT:'2xs'})}
                                        placeholder={"Введите пароль повторно"}
                                />
                        </Layout>
                        
                    </Card>
                  )}
                  {step.id === 1 && (
                    <Card border className={cnMixSpace({p:'l', mT:'xl'})}>
                      <Layout direction="column" className={cnMixSpace({mT:'m'})}>
                              <Text size="s" >Наименование организации:</Text>
                              <TextField
                                      value={data.companyName}
                                      onChange={(value) => {
                                              setData(prev => ({...prev, companyName: value}))
                                      }}
                                      size="s"
                                      className={cnMixSpace({mT:'2xs'})}
                                      placeholder={ "Введите наименование организации"}
                                      type="textarea"
                                      maxRows={3}
                                      style={{minWidth: '350px'}}
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
                                      style={{maxWidth: '450px', minWidth: '350px'}}
                                      className={cnMixSpace({mT:'2xs'})}
                                      placeholder={ "Введите краткое наименование организации"}
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
                                      style={{maxWidth: '450px', minWidth: '350px'}}
                                      className={cnMixSpace({mT:'2xs'})}
                                      placeholder={"Введите ИНН организации"}
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
                                      style={{maxWidth: '450px', minWidth: '350px'}}
                                      className={cnMixSpace({mT:'2xs'})}
                                      placeholder={"Введите юридический адрес"} 
                                      type="textarea"
                                      maxRows={4}
                              />
                      </Layout>
                      </Card>
                  )}

                  {step.id === 2 && (users && users.length > 0) && users.map((user) => (
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
                      )
                  )}
                  {step.id === 2 && (
                    <Layout direction="row" style={{justifyContent: 'center'}}>
                            <Button 
                                    label={'Добавить еще'}
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
                  )}
                    <Layout direction='row' className={cnMixSpace({mT: 'm'})} style={{justifyContent: 'center', alignItems: 'center'}}>
                      {step.id !== 2 && (
                        <Button 
                          label={'Продолжить'} 
                          onClick={() => { setStep(steps.find((el => (el.id === (step.id + 1)))) ?? steps[0]) }} 
                          size='m'
                          className={cnMixSpace({mL: 'xs'})}
                        />
                      )}
                    </Layout>
                </Card>
              </Modal>
      
        
    );
};

export default RegistrationModal;