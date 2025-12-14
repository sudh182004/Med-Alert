import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { processFilesInline } from '../utils/ocrProcess';

type MedicalReport = {
  id: string;
  title: string;
  date: string;
  summary: string;
  fields?: Record<string, any>;
};

const STORAGE_KEY = 'medicalReports_v1';

export default function ReportsScreen() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<Array<{ id: number; file?: any }>>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // ❗ Stop merged summary from opening
  const openDetails = (report: any) => {
    if (report.id === 'merged-summary') return;
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setShowModal(false);
  };

  // 🗑 Delete selected report
  const deleteReport = async (id: string) => {
    const filtered = reports.filter((r) => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    setReports(filtered);
    closeModal();
  };

  // 🔄 Load saved reports + remove duplicate merged cards
  const loadReports = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const list = JSON.parse(stored);
      const unique = list.filter(
        (r: any, i: number, arr: any[]) =>
          r.id !== 'merged-summary' ||
          i === arr.findIndex(x => x.id === 'merged-summary')
      );
      setReports(unique);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    }
  };

  const saveReports = async (next: MedicalReport[]) => {
    setReports(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const clearReports = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setReports([]);
  };

  useEffect(() => { loadReports(); }, []);

  // 📌 File uploading helpers
  const addUpload = () => setUploads((u) => [...u, { id: Date.now() }]);
  const removeUpload = (id: number) => setUploads((u) => u.filter((x) => x.id !== id));
  const updateUpload = (id: number, file: any) => setUploads((u) => u.map((x) => (x.id === id ? { ...x, file } : x)));

  const pickFile = async (id: number) => {
    Alert.alert('Select File Type', 'Choose what you want to upload:', [
      {
        text: 'Document (PDF)',
        onPress: async () => {
          try {
            const result: any = await DocumentPicker.getDocumentAsync({
              type: 'application/pdf',
              copyToCacheDirectory: true,
            });
            if (!result || result.type !== 'success') return;

            const fileName = result.name || `file-${Date.now()}.pdf`;
            const destPath = `${FileSystem.cacheDirectory}${fileName}`;

            await FileSystem.copyAsync({ from: result.uri, to: destPath });
            await new Promise(resolve => setTimeout(resolve, 100));

            const base64 = await FileSystem.readAsStringAsync(destPath, {
              encoding: FileSystem.EncodingType.Base64,
            });

            updateUpload(id, { name: fileName, mimeType: 'application/pdf', base64 });
          } catch (err: any) {
            Alert.alert('PDF Pick Error', err?.message || 'Unknown error');
          }
        },
      },
      {
        text: 'Image',
        onPress: async () => {
          try {
            const result: any = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 1,
              base64: true,
            });

            let base64 = result.base64;
            if (!base64 && result.assets?.[0]?.base64) base64 = result.assets[0].base64;

            if (!base64) return Alert.alert('Image Error', 'Could not read image');

            const name =
              (result.uri || result.assets?.[0]?.uri)?.split('/').pop() ||
              `image-${Date.now()}.jpg`;

            updateUpload(id, { name, mimeType: 'image/jpeg', base64 });
          } catch (err: any) {
            Alert.alert('Image Pick Error', err?.message || 'Unknown error');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // 🚀 OCR + Merge Summary (NO EMPTY MERGED CARD)
  const uploadAll = async () => {
    try {
      const filesToProcess = uploads.map((u) => u.file).filter(Boolean);
      if (filesToProcess.length === 0)
        return Alert.alert('No files', 'Please add and select files to upload.');

      setLoading(true);

      const uploadInputs = filesToProcess.map((f: any) => ({
        name: f.name || 'file',
        content_base64: f.base64,
        mimeType: f.mimeType || (f.name?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      }));

      const newProcessed = await processFilesInline(uploadInputs);

      const oldWithoutMerged = reports.filter((r) => r.id !== 'merged-summary');
      const combinedReports = [...newProcessed, ...oldWithoutMerged];

      const allSummaries = combinedReports
        .map((r) => r.summary || r.fields?.full_text || '')
        .filter(Boolean);

      const mergedSummary = allSummaries.join('\n\n').slice(0, 2500);

      // 🛑 If no summary, don't create merged card
      if (!mergedSummary || mergedSummary.trim().length < 10) {
        await saveReports(combinedReports);
        setUploads([]);
        return;
      }

      const mergedReport = {
        id: 'merged-summary',
        title: '📌 Medical Report Insights',
        date: new Date().toISOString(),
        summary: mergedSummary,
        fields: { merged_count: combinedReports.length },
      };

      const final = [mergedReport, ...combinedReports];

      await saveReports(final);
      setUploads([]);
    } catch (err: any) {
      Alert.alert('Processing Error', err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // 📄 Card UI
  const renderItem = ({ item }: { item: MedicalReport }) => (
    <TouchableOpacity onPress={() => openDetails(item)}>
      <View style={styles.reportCard}>
        <Text style={styles.titleSmall}>{item.title}</Text>
        <Text style={styles.meta}>🗓 {item.date}</Text>
        <Text numberOfLines={4} style={styles.summary}>{item.summary}</Text>
        {item.id !== 'merged-summary' && (
          <Text style={styles.viewMore}>📄 View full details</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // 📝 Convert JSON to readable text
  const formatReportText = (fields: any) => {
    if (!fields) return "No details available.";

    return `
🔎 Title: ${fields.title || ""}
📅 Date: ${fields.report_date || ""}

👤 Patient
• ${fields.patient?.name || ""}
• ${fields.patient?.gender || ""}
• DOB: ${fields.patient?.dob || ""}
• ID: ${fields.patient?.id || ""}
• Address: ${fields.patient?.address || ""}

🏥 Hospital
• ${fields.hospital || ""}
• Department: ${fields.department || ""}
• Doctor: ${fields.doctor || ""}

🧪 Findings
${fields.findings || ""}

💊 Medications
${(fields.medications || []).join(", ")}

💉 Procedures
${(fields.procedures || []).join(", ")}

📌 Impression
${fields.impression || ""}

📍 Recommendations
${fields.recommendations || ""}

📄 Full Text:
${fields.full_text || ""}
`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧾 Medical Reports</Text>

      <View style={{ width: '100%', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Button title="Add File" onPress={addUpload} />
          <Button title="Upload All" onPress={uploadAll} />
        </View>

        {uploads.length === 0 ? (
          <Text style={{ color: '#666', marginBottom: 8 }}>No files added.</Text>
        ) : (
          uploads.map((u) => (
            <View key={u.id} style={styles.uploadRow}>
              <Text style={{ flex: 1 }}>{u.file?.name ?? 'No file selected'}</Text>
              <View style={{ width: 160, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button title="Pick" onPress={() => pickFile(u.id)} />
                <Button title="Remove" color="red" onPress={() => removeUpload(u.id)} />
              </View>
            </View>
          ))
        )}
      </View>

      {loading && <ActivityIndicator size="large" color="#007AFF" />}

      {reports.length === 0 && !loading ? (
        <Text style={styles.emptyText}>No medical reports yet. Upload a file to get started.</Text>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item, index) => item.id + '-' + index}
          renderItem={renderItem}
          style={{ width: '100%' }}
        />
      )}

      {reports.length > 0 && (
        <View style={{ marginTop: 12, width: '100%' }}>
          <Button title="Clear Reports" color="red" onPress={clearReports} />
        </View>
      )}

      {/* 💠 Modal showing readable text + delete */}
      {showModal && selectedReport && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedReport.title}</Text>
              <Text style={styles.meta}>🗓 {selectedReport.date}</Text>

              <Text style={styles.modalContent}>
                {formatReportText(selectedReport.fields)}
              </Text>
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Button title="Close" onPress={closeModal} />
              <Button title="Delete" color="red" onPress={() => deleteReport(selectedReport.id)} />
            </View>
          </View>
        </View>
      )}

      <View style={{ height: Platform.OS === 'ios' ? 40 : 16 }} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    alignItems: 'center',
    backgroundColor: '#F7F8FA'
  },

  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    marginBottom: 15,
    color: '#222'
  },

  // 🔹 Upload rows
  uploadRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 0.6,
    borderColor: '#E5E5E5'
  },

  viewMore: { fontSize: 12, color: '#007AFF', marginTop: 5 },

  meta: { 
    fontSize: 12, 
    color: '#777', 
    marginBottom: 4 
  },

  // 📄 Report Card UI
  reportCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 14,
    
    // Soft shadow
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,

    borderWidth: 0.4,
    borderColor: '#eee',
  },

  titleSmall: { 
    fontSize: 17, 
    fontWeight: '700',
    color: '#111',
    marginBottom: 3
  },

  summary: { 
    fontSize: 14, 
    color: '#444',
    marginTop: 4
  },

  emptyText: { 
    fontSize: 16, 
    color: '#999', 
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic'
  },

  // 🌫 Modal Overlay
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', 
    alignItems: 'center',
  },

  // 🎭 Modal
  modal: {
    width: '92%',
    maxHeight: '82%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },

  modalTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    marginBottom: 8,
    color: '#222'
  },

  modalContent: {
    fontSize: 14,
    color: '#333',
    marginVertical: 10,
    lineHeight: 20
  },
});
