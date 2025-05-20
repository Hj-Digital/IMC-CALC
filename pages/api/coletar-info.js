import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyAZv7AjRcpcpZn4_tGc4gh60VIMR2ulupk",
  authDomain: "loctest-12b62.firebaseapp.com",
  projectId: "loctest-12b62",
  storageBucket: "loctest-12b62.firebasestorage.app",
  messagingSenderId: "386604910936",
  appId: "1:386604910936:web:22171e50fd1806afb6fd2d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const data = req.body;

  // Envia para o Firebase
  try {
    await push(ref(db, 'coletas'), data);
  } catch (err) {
    console.error('Erro ao salvar no Firebase:', err);
  }

  // Salva localmente no arquivo JSON
  const filePath = path.join(process.cwd(), 'data.json');
  let registros = [];

  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      registros = JSON.parse(fileData);
    }
  } catch (err) {
    console.error('Erro lendo o arquivo local:', err);
  }

  registros.push(data);

  try {
    fs.writeFileSync(filePath, JSON.stringify(registros, null, 2));
  } catch (err) {
    console.error('Erro salvando localmente:', err);
  }

  res.status(200).json({ status: 'Dados salvos com sucesso!' });
}
