import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
  Platform 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../Services/Api';
import Logo from '../Img/Logo-Paginas.png';

const PresencaScreen = ({ route, navigation }) => {
  const { selectedTurmaId: initialTurmaId } = route.params || {};

  const [turmas, setTurmas] = useState([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState(initialTurmaId);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [statusFrequencia, setStatusFrequencia] = useState({});
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formattedDate = dataSelecionada.toISOString().split('T')[0];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchTurmas = async () => {
      setLoading(true);
      try {
        const response = await api.get('/Turmas');

        const turmasData = response.data.map(t => ({
          id: t.idTurma,
          name: t.nome,
        }));
        setTurmas(turmasData);

        if (!initialTurmaId && turmasData.length > 0) {
          setSelectedTurmaId(turmasData[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar turmas:", error.response ? error.response.data : error.message);
        Alert.alert("Erro de API", "Não foi possível carregar a lista de turmas.");
      } finally {
        setLoading(false);
      }
    };
    fetchTurmas();
  }, [initialTurmaId]);


  const fetchAttendanceData = useCallback(async () => {
    if (!selectedTurmaId) return;

    setLoading(true);
    setAlunos([]);
    setStatusFrequencia({});
    try {
      const alunosResponse = await api.get(`/Alunos/PorTurma/${selectedTurmaId}`);
      const fetchedAlunos = alunosResponse.data.map(a => ({
        id: a.idAluno,
        name: a.nome,
      }));
      setAlunos(fetchedAlunos);

      let initialAttendance = {};

      const attendanceResponse = await api.get(`/Presencas/PorTurmaData?idTurma=${selectedTurmaId}&dataAula=${formattedDate}`);

      const existingAttendance = attendanceResponse.data.reduce((acc, freq) => {
        acc[freq.idAluno] = freq.presente ? 'P' : 'F';
        return acc;
      }, {});

      if (Object.keys(existingAttendance).length > 0) {
        initialAttendance = existingAttendance;
        Alert.alert("Atenção", "Frequência para esta data já registrada. Você pode editá-la e salvar novamente.");
      } else {
        initialAttendance = fetchedAlunos.reduce((acc, aluno) => {
          acc[aluno.id] = 'P';
          return acc;
        }, {});
      }

      setStatusFrequencia(initialAttendance);

    } catch (error) {
      console.warn("Nenhuma frequência anterior encontrada para a data/turma ou erro de API:", error.message);

      const initialAttendance = alunos.reduce((acc, aluno) => {
        acc[aluno.id] = 'P';
        return acc;
      }, {});
      setStatusFrequencia(initialAttendance);

      if (error.response && error.response.status !== 404 && error.response.status !== 204) {
        Alert.alert("Erro de API", "Não foi possível carregar os alunos ou a frequência. Verifique o endpoint.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedTurmaId, formattedDate, alunos.length]);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedTurmaId, dataSelecionada, fetchAttendanceData]);

  const toggleAttendance = (alunoId) => {
    setStatusFrequencia(prevStatus => {
      const currentStatus = prevStatus[alunoId];
      const newStatus = currentStatus === 'P' ? 'F' : 'P';
      return {
        ...prevStatus,
        [alunoId]: newStatus,
      };
    });
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || dataSelecionada;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDataSelecionada(currentDate);
  };


  const handleSaveAttendance = async () => {
    if (isSaving) return;
    if (!selectedTurmaId || alunos.length === 0) {
      Alert.alert("Atenção", "Selecione uma turma com alunos antes de salvar.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = Object.keys(statusFrequencia).map(alunoId => ({
        IdAluno: alunoId,
        IdTurma: selectedTurmaId,
        DataAula: formattedDate,
        Presente: statusFrequencia[alunoId] === 'P',
      }));

      await api.post('/Presencas', payload);

      Alert.alert("Sucesso", "Chamada salva com sucesso!");

    } catch (error) {
      const errorMessage = error.response && error.response.data
        ? JSON.stringify(error.response.data) : error.message;

      console.error("Erro ao salvar a chamada:", errorMessage);
      Alert.alert("Erro de API", `Falha ao salvar a chamada. Detalhes: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderItem = ({ item }) => {
    const status = statusFrequencia[item.id] || 'P';
    const isPresent = status === 'P';

    return (
      <View style={styles.alunoItem}>
        <Text style={styles.alunoNome}>{item.name}</Text>
        <TouchableOpacity
          style={[styles.statusButton, isPresent ? styles.present : styles.absent]}
          onPress={() => toggleAttendance(item.id)}
          disabled={loading || isSaving}
        >
          <Icon
            name={isPresent ? 'check-circle' : 'cancel'}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#6A1B9A" />
        </TouchableOpacity>

        <Image
          source={Logo}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.pageTitleContainer}>
          <Icon name="check-circle-outline" size={24} color="#6A1B9A" />
          <Text style={styles.pageTitle}>Registro de Presença</Text>
        </View>

        {/* Seletor de Data */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Data da Aula:</Text>
          <TouchableOpacity
            style={styles.dateInputContainer}
            onPress={() => setShowDatePicker(true)}
            disabled={loading || isSaving}
          >
            <TextInput
              style={styles.dateInputText}
              value={dataSelecionada.toLocaleDateString('pt-BR')}
              editable={false}
            />
            <Icon name="calendar-today" size={24} color="#6A1B9A" style={styles.calendarIcon} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={dataSelecionada}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
            />
          )}
        </View>

        {/* Dropdown de Turmas */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Selecione a Turma:</Text>
          <Picker
            selectedValue={selectedTurmaId}
            onValueChange={(itemValue) => setSelectedTurmaId(itemValue)}
            style={styles.picker}
            enabled={!loading && turmas.length > 0 && !isSaving}
          >
            {turmas.length > 0 ? (
              turmas.map((turma) => (
                <Picker.Item key={turma.id} label={turma.name} value={turma.id} />
              ))
            ) : (
              <Picker.Item label="Nenhuma turma disponível" value={null} />
            )}
          </Picker>
        </View>

        {loading && <ActivityIndicator size="large" color="#6A1B9A" style={{ marginTop: 20 }} />}

        {/* Lista de Alunos */}
        {selectedTurmaId && !loading && (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Alunos (Total: {alunos.length})</Text>

            {alunos.length > 0 ? (
              <FlatList
                data={alunos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.emptyListText}>Nenhum aluno encontrado nesta turma.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Botão Salvar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveAttendance}
          disabled={isSaving || alunos.length === 0}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>SALVAR</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1eefb',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  customHeader: {
    backgroundColor: '#f1eefb',
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  logoImage: {
    width: 150,
    height: 35,
  },
  pageTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#333',
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1C4E9',
    marginBottom: 10,
    padding: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 15,
    borderColor: '#D1C4E9',
    borderWidth: 1,
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  calendarIcon: {
    marginLeft: 10,
  },
  listSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 10,
  },
  listTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  alunoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  alunoNome: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#333',
    flex: 1,
  },
  statusButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  present: {
    backgroundColor: '#4CAF50',
  },
  absent: {
    backgroundColor: '#F44336',
  },
  emptyListText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
    fontFamily: 'Poppins',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#7719b9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});

export default PresencaScreen;