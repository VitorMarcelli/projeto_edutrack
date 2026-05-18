import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { supabase } from '../../lib/supabase';

export function CreateTaskScreen({ route, navigation }: any) {
  const { subjectId } = route.params;
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataPrevista, setDataPrevista] = useState(''); // Formato esperado YYYY-MM-DD
  const [tempoEstimado, setTempoEstimado] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'O título da tarefa é obrigatório.');
      return;
    }

    setLoading(true);

    const novaTarefa = {
      subject_id: subjectId,
      titulo,
      descricao: descricao || null,
      data_prevista: dataPrevista || null, // Se vazio, o Supabase salvará como null
      tempo_estimado: tempoEstimado ? parseInt(tempoEstimado) : null,
      status: 'pendente'
    };

    const { error } = await supabase
      .from('academic_tasks')
      .insert([novaTarefa]);

    if (error) {
      Alert.alert('Erro ao criar tarefa', error.message);
    } else {
      Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
      navigation.goBack();
    }
    
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Tarefa</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Título da Tarefa *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Ler capítulo 3"
          placeholderTextColor="#888"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Data Prevista (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2026-05-20"
          placeholderTextColor="#888"
          value={dataPrevista}
          onChangeText={setDataPrevista}
        />

        <Text style={styles.label}>Tempo Estimado (minutos)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 120"
          placeholderTextColor="#888"
          value={tempoEstimado}
          onChangeText={setTempoEstimado}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Descrição (Opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detalhes adicionais..."
          placeholderTextColor="#888"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Salvar Tarefa</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#0056D2',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  formContainer: {
    padding: 24,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0056D2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    minHeight: 48,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
