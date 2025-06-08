import { useState } from 'react';
import bcrypt from 'bcryptjs';

import { Text } from '@consta/uikit/Text';
import { Layout } from '@consta/uikit/Layout';
import { TextField } from '@consta/uikit/TextField';
import { Button } from '@consta/uikit/Button';
import { auth } from './services/AuthorizationService';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Card } from '@consta/uikit/Card';
import { presetGpnDefault, Theme } from '@consta/uikit/Theme';

const Auth = () => {
    const [username, setUsername] = useState('');
    const [NHPassword, setNHPassword] = useState('');
    const handleLogin = async () => {
      const password = await bcrypt.hash(NHPassword, 10);
        try {
            const res = await auth({username, password});
            localStorage.setItem('token', res.token);
            window.location.reload();
        } catch (error) {
            console.log(error)
        }
    };


    return (
      <div className="App">
            <Theme preset={presetGpnDefault}>
              <div style={{width: '100vw', height: '100vh', alignContent: 'center', justifyItems: 'center', backgroundColor: '#ecf1f4'}}>
                <Card className={cnMixSpace({p: 'xl'})} style={{ alignSelf: 'center', backgroundColor: '#ffff'}}>
                  <Text view='brand' size='2xl'>Авторизация</Text>
                  <Layout direction='column' >
                    <Layout direction='column' style={{width: '100%',  }} className={cnMixSpace({mT: 'm'})}>
                        <Text align='left'>Логин:</Text>
                        <TextField 
                          value={username}
                          onChange={(value) =>{
                              if (value) {
                                setUsername(value)
                              } else {
                                setUsername('')
                              }
                            }}
                            className={cnMixSpace({mT: 'xs'})}
                            size='s'
                        />
                    </Layout>
                    <Layout direction='column' style={{width: '100%',  alignSelf: 'center'}} className={cnMixSpace({mT: 'm'})}>
                        <Text align='left'>Пароль:</Text>
                        <TextField 
                          value={NHPassword}
                          type={'password'}
                          onChange={(value) =>{
                              if (value) {
                                setNHPassword(value)
                              } else {
                                setNHPassword('')
                              }
                            }}
                            className={cnMixSpace({mT: 'xs'})}
                            size='s'
                          />
                    </Layout>
                    <Button label={'Войти'} onClick={()=>{void handleLogin()}} style={{width: '150px', alignSelf: 'center'}} className={cnMixSpace({mT: 'm'})}/>
                  </Layout>
                    
                </Card>
              </div>
          </Theme>
      </div>
      
        
    );
};

export default Auth;