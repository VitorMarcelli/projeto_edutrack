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

export function CreateSubjectScreen({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [professor, setProfessor] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome da disciplina é obrigatório.');
      return;
    }

    setLoading(true);
    
    // Pega o ID do usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      Alert.alert('Erro', 'Sessão inválida. Faça login novamente.');
      setLoading(false);
      return;
    }

    const novaDisciplina = {
      user_id: user.id,
      nome,
      professor: professor || null,
      carga_horaria: cargaHoraria ? parseInt(cargaHoraria) : null,
      descricao: descricao || null,
    };

    const { error } = await supabase
      .from('subjects')
      .insert([novaDisciplina]);

    if (error) {
      Alert.alert('Erro ao criar disciplina', error.message);
    } else {
      Alert.alert('Sucesso', 'Disciplina criada com sucesso!');
      navigation.goBack(); // Volta para o Dashboard
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
        <Text style={styles.headerTitle}>Nova Disciplina</Text>
        <View style={{ width: 60 }} /> {/* Espaçador para alinhar o título */}
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Nome da Disciplina *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Engenharia de Software"
          placeholderTextColor="#888"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Professor</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Carlos Silva"
          placeholderTextColor="#888"
          value={professor}
          onChangeText={setProfessor}
        />

        <Text style={styles.label}>Carga Horária (horas)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 60"
          placeholderTextColor="#888"
          value={cargaHoraria}
          onChangeText={setCargaHoraria}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Anotações sobre a disciplina..."
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
            <Text style={styles.buttonText}>Salvar Disciplina</Text>
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
    minHeight: 48, // Touch target rule
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
