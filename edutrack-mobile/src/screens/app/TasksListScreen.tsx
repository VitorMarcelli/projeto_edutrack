import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

export function TasksListScreen({ route, navigation }: any) {
  const { subjectId, subjectName } = route.params;
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/insights/${subjectId}`);
      if (response.ok) {
        const data = await response.json();
        setInsightsData(data);
      }
    } catch (e) {
      console.log('Error fetching insights:', e);
    } finally {
      setLoadingInsights(false);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('academic_tasks')
      .select('*')
      .eq('subject_id', subjectId)
      .order('data_prevista', { ascending: true }); // Ordena por data

    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      fetchInsights();
    }, [subjectId])
  );

  const toggleTaskStatus = async (task: any) => {
    const newStatus = task.status === 'concluida' ? 'pendente' : 'concluida';
    
    // Optimistic UI update
    setTasks(current => 
      current.map(t => t.id === task.id ? { ...t, status: newStatus } : t)
    );

    const { error } = await supabase
      .from('academic_tasks')
      .update({ status: newStatus })
      .eq('id', task.id);

    if (error) {
      // Revert if error
      fetchTasks();
    } else {
      // Atualiza as métricas da IA
      fetchInsights();
    }
  };

  const renderTask = ({ item }: { item: any }) => {
    const isCompleted = item.status === 'concluida';
    
    return (
      <View style={styles.card}>
        <View style={styles.taskInfo}>
          <Text style={[styles.cardTitle, isCompleted && styles.completedText]}>
            {item.titulo}
          </Text>
          {item.data_prevista && (
            <Text style={styles.cardSubtitle}>Entrega: {item.data_prevista}</Text>
          )}
          {item.tempo_estimado && (
            <Text style={styles.cardSubtitle}>Tempo Estimado: {item.tempo_estimado} min</Text>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.checkButton, isCompleted && styles.checkButtonActive]}
          onPress={() => toggleTaskStatus(item)}
        >
          {isCompleted && <Text style={styles.checkIcon}>✓</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{subjectName}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#0056D2" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTask}
            ListHeaderComponent={() => {
              if (loadingInsights) {
                return <ActivityIndicator size="small" color="#0056D2" style={{ marginBottom: 16 }} />;
              }
              if (!insightsData || insightsData.total_tarefas === 0) return null;

              return (
                <View style={styles.insightsCard}>
                  <Text style={styles.insightsTitle}>Progresso: {insightsData.progresso_percentual}%</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${insightsData.progresso_percentual}%` }]} />
                  </View>
                  <Text style={styles.insightsText}>🤖 IA: {insightsData.insights}</Text>
                </View>
              );
            }}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma tarefa cadastrada nesta disciplina.</Text>
            }
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask', { subjectId })}
      >
        <Text style={styles.fabText}>+ Nova Tarefa</Text>
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
    flex: 1,
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  taskInfo: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  insightsCard: {
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D2E3FC',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A73E8',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1A73E8',
  },
  insightsText: {
    fontSize: 14,
    color: '#3C4043',
    lineHeight: 20,
  },
  checkButtonActive: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkIcon: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
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
