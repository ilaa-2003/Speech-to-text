import { SpeechTranscriptionModule } from './components/SpeechTranscriptionModule';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <SpeechTranscriptionModule
          wakeWord="hi"
          sleepWord="bye"
          onTranscriptUpdate={(text) => {
            console.log('New transcript:', text);
          }}
        />
      </div>
    </div>
  );
}

export default App;
