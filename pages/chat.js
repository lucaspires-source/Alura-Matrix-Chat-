import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React,{useState, useEffect} from 'react';
import appConfig from '../config.json';
import { SUPABASE_ANON_KEY,SUPABASE_URL } from '../keys';
import { createClient } from '@supabase/supabase-js';
import { formatWithValidation } from 'next/dist/shared/lib/utils';
import { useRouter } from 'next/router';
import { route } from 'next/dist/server/router';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';


const supabaseClient = createClient(SUPABASE_URL,SUPABASE_ANON_KEY)

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
      .from('mensagens')
      .on('INSERT', (resLive) => {
        adicionaMensagem(resLive.new);
      })
      .subscribe();
  }

export default function ChatPage() {
    const [mensagem, setMensagem] = useState('')
    const [listaDeMensagens, setListaDeMensagens] = useState([])
    const router = useRouter()
    const usuarioLogado = router.query.username
    useEffect(() =>{
        supabaseClient
            .from('mensagens')
            .select('*')
            .then(({data}) =>{
                setListaDeMensagens(data)
    })

    const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
        console.log('Nova mensagem:', novaMensagem);
        console.log('listaDeMensagens:', listaDeMensagens);
        setListaDeMensagens((valorAtualDaLista) => {
          console.log('valorAtualDaLista:', valorAtualDaLista);
          return [
            novaMensagem,
            ...valorAtualDaLista,
          ]
        });
      });
  
      return () => {
        subscription.unsubscribe();
      }
    ,[]})
    function handleNovaMensagem(novaMensagem){

        const mensagem = {
            texto:novaMensagem,
            de:usuarioLogado,
        }

        supabaseClient
            .from('mensagens')
            .insert([mensagem])
            .order('id', {ascending:true})
            .then(({data}) =>{
                setListaDeMensagens([
                    ...listaDeMensagens,
                    data[0],
                ])
            })

        setMensagem('')
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList mensagens={listaDeMensagens} />
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            value={mensagem}
                            onChange = {function (e) {
                                setMensagem(e.target.value)
                            }}
                            onKeyPress={(e) => {
                                if(e.key === 'Enter'){
                                    handleNovaMensagem(mensagem)
                                }
                            }}
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker  onStickerClick={(sticker) => {handleNovaMensagem(':sticker: ' + sticker)}} />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) =>{
                return (
                    <Text
                    key={mensagem.id}
                    tag="li"
                    styleSheet={{
                        borderRadius: '5px',
                        padding: '6px',
                        marginBottom: '12px',
                        hover: {
                            backgroundColor: appConfig.theme.colors.neutrals[700],
                        }
                    }}
                >
                    <Box
                        styleSheet={{
                            marginBottom: '8px',
        
                        }}
                    >
                        <Image
                            styleSheet={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'inline-block',
                                marginRight: '8px',
                            }}
                            src={`https://github.com/${mensagem.de}.png`}
                        />
                        <Text tag="strong">
                            {mensagem.de}
                        </Text>
                        <Text
                            styleSheet={{
                                fontSize: '10px',
                                marginLeft: '8px',
                                color: appConfig.theme.colors.neutrals[300],
                            }}
                            tag="span"
                        >
                            {(new Date().toLocaleDateString())}
                        </Text>
                    </Box>
                    {mensagem.texto.startsWith(':sticker:')? (<Image src={mensagem.texto.replace(':sticker:', '')} /> ): (mensagem.texto)}
                </Text>
                )
            })}
           
        </Box>
    )
}
