import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

export function DashboardScreen({ navigation }: any) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubjects(data);
    }
    setLoading(false);
  };

  // Recarrega as disciplinas sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      fetchSubjects();
    }, [])
  );

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const renderSubject = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        navigation.navigate('TasksList', { 
          subjectId: item.id, 
          subjectName: item.nome 
        });
      }}
    >
      <Text style={styles.cardTitle}>{item.nome}</Text>
      {item.professor && <Text style={styles.cardSubtitle}>Prof: {item.professor}</Text>}
      {item.carga_horaria && <Text style={styles.cardSubtitle}>Carga horária: {item.carga_horaria}h</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Minhas Disciplinas</Text>
          <Text style={styles.subtitle}>Acompanhe seu progresso</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#0056D2" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id}
            renderItem={renderSubject}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma disciplina cadastrada ainda.</Text>
            }
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateSubject')}
      >
        <Text style={styles.fabText}>+ Nova Disciplina</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1, // shadow for android
    shadowColor: '#000', // shadow for ios
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#0056D2',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
