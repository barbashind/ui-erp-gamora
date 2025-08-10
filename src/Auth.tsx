import { useEffect, useState } from 'react';
import bcrypt from 'bcryptjs';

// import { ReactMaskOpts, useIMask } from 'react-imask';

// компоненты Consta
import { Text } from '@consta/uikit/Text';
import { Layout } from '@consta/uikit/Layout';
import { TextField } from '@consta/uikit/TextField';
import { Button } from '@consta/uikit/Button';
import { auth } from './services/AuthorizationService';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Card } from '@consta/uikit/Card';
import { Theme } from '@consta/uikit/Theme';
import { presetBarbashDesignDefault } from './barbashDesign/presets/presetBarbasDesignDefault';
import { presetBarbashDesignDark } from './barbashDesign/presets/presetBarbashDesignDark';
import RegistrationModal from './RegistrationModal';

const Auth = () => {
    const [username, setUsername] = useState('');
    const [NHPassword, setNHPassword] = useState('');
    const [regIsOpen, setRegIsOpen] = useState<boolean>(false);

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

    const [themePreset, setThemePreset] = useState(presetBarbashDesignDefault);
    
      useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
        const handleThemeChange = (event: MediaQueryListEvent) => {
          if (event.matches) {
            setThemePreset(presetBarbashDesignDark);
          } else {
            setThemePreset(presetBarbashDesignDefault);
          }
        };
    
        // Задаем начальную тему
        handleThemeChange(mediaQuery as unknown as MediaQueryListEvent);
    
        // Добавляем слушатель изменений
        mediaQuery.addEventListener('change', handleThemeChange);
    
        return () => {
          mediaQuery.removeEventListener('change', handleThemeChange);
        };
    }, []);

  //  const { ref } = useIMask<
  //   HTMLInputElement,
  //   ReactMaskOpts
  // >({
  //   mask: '+ 7 (000)000-00-00',
  // });

    return (
      <div className="App" >
            <Theme preset={themePreset}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100vw',
                  height: '100vh',
                  backgroundImage: themePreset === presetBarbashDesignDark ? 'url(src/assets/images/BackgroundImage.jpg)' : 'url(src/assets/images/BackgroundLightImage.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <Card className={cnMixSpace({p: 'xl'})} style={{ alignSelf: 'center', backgroundColor: 'var(--color-control-bg-default)'}}>
                  <Text view='brand' size='2xl' align='center' style={{width: '100%',  }}>RENTIFY</Text>
                  <Layout direction='column' >
                    <Layout direction='column' style={{width: '100%',  }} className={cnMixSpace({mT: 'm'})}>
                        <TextField 
                          value={username}
                          onChange={(value) =>{
                              if (value) {
                                setUsername(value)
                              } else {
                                setUsername('')
                                
                              }
                            }}
                            placeholder='+ 7 (***) ***-**-**'
                            className={cnMixSpace({mT: 'xs'})}
                            size='m'
                            caption='Укажите номер телефона'
                        />
                    </Layout>
                    <Layout direction='column' style={{width: '100%',  alignSelf: 'center'}} className={cnMixSpace({mT: 'm'})}>
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
                            size='m'
                            caption='Введите пароль'
                          />
                    </Layout>
                    <Layout direction='row' className={cnMixSpace({mT: 'm'})}>
                      <Button 
                        label={'ВОЙТИ'} 
                        onClick={()=>{void handleLogin()}} 
                        style={{width: '150px', alignSelf: 'center'}} 
                        className={cnMixSpace({mR: 'm'})}
                        size='s'
                      />
                      <Button 
                        label={'РЕГИСТРАЦИЯ'} 
                        onClick={()=>{setRegIsOpen(true)}} 
                        style={{width: '150px', alignSelf: 'center'}} 
                        size='s'
                        view='secondary'
                      />
                    </Layout>
                    
                  </Layout>
                    
                </Card>
                <RegistrationModal
                  isModalOpen={regIsOpen}
                  setIsModalOpen={setRegIsOpen}
                />
              </div>
          </Theme>
      </div>
      
        
    );
};

export default Auth;