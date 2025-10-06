# Speech-to-Text Transcription Module with Wake/Sleep Word Detection

A reusable React module that enables real-time speech-to-text transcription, activating only when a wake word is detected and stopping when a sleep word is spoken.

## Features

- **Wake/Sleep Word Detection**: Toggle transcription on/off using customizable trigger words (default: "Hi" to start, "Bye" to stop)
- **Real-time Transcription**: Continuous speech-to-text conversion while active
- **Modular Design**: Easily reusable in any React application (including React Native with appropriate adapters)
- **Visual Feedback**: Clear indicators for listening state and transcription status
- **Browser-based**: Uses the Web Speech API (free, no API keys required)

## Architecture

The module consists of two main components:

### 1. `useSpeechRecognition` Hook (`src/hooks/useSpeechRecognition.ts`)

Core logic for speech recognition:
- Manages Web Speech API lifecycle
- Detects wake and sleep words
- Handles transcription state
- Provides callbacks for transcript updates and state changes

### 2. `SpeechTranscriptionModule` Component (`src/components/SpeechTranscriptionModule.tsx`)

UI component that:
- Provides visual interface for the module
- Displays real-time transcripts
- Shows listening and transcription states
- Handles user interactions

## How It Works

1. **Continuous Listening**: When activated, the module continuously listens for speech
2. **Wake Word Detection**: Recognizes the wake word (default: "Hi") to start transcription
3. **Active Transcription**: Transcribes all speech into text in real-time
4. **Sleep Word Detection**: Recognizes the sleep word (default: "Bye") to stop transcription
5. **Repeatable Cycle**: Can be activated and deactivated multiple times

## Usage

### Basic Implementation

```tsx
import { SpeechTranscriptionModule } from './components/SpeechTranscriptionModule';

function App() {
  return (
    <SpeechTranscriptionModule
      wakeWord="hi"
      sleepWord="bye"
      onTranscriptUpdate={(text) => {
        console.log('New transcript:', text);
      }}
    />
  );
}
```

### Using the Hook Directly

```tsx
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

function MyComponent() {
  const {
    isListening,
    isActive,
    transcript,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    wakeWord: 'start',
    sleepWord: 'stop',
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        console.log('Final transcript:', text);
      }
    },
  });

  return (
    <div>
      <button onClick={startListening}>Start</button>
      <button onClick={stopListening}>Stop</button>
      <p>Status: {isActive ? 'Transcribing' : 'Waiting'}</p>
      <p>{transcript}</p>
    </div>
  );
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wakeWord` | string | "hi" | Word to activate transcription |
| `sleepWord` | string | "bye" | Word to deactivate transcription |
| `onTranscriptUpdate` | function | - | Callback when new transcript is available |
| `continuous` | boolean | true | Enable continuous recognition |
| `interimResults` | boolean | true | Show interim results |
| `lang` | string | "en-US" | Language for recognition |

## Browser Compatibility

This module uses the Web Speech API, which is supported in:
- Chrome/Edge (recommended)
- Safari
- Not supported: Firefox (Web Speech API not available)

## Running the Demo

```bash
npm install
npm run dev
```

Then:
1. Open the application in Chrome or Edge
2. Click "Start Listening"
3. Say "Hi" to activate transcription
4. Speak normally - your words will be transcribed
5. Say "Bye" to stop transcription
6. Repeat as needed

## React Native Adaptation

To use this in React Native:

1. Replace Web Speech API with a mobile equivalent:
   - Use `react-native-voice` for iOS/Android
   - Or integrate with services like Google Cloud Speech-to-Text, Deepgram, or Whisper

2. The core logic in `useSpeechRecognition` can be adapted by:
   - Replacing the Web Speech API calls with mobile SDK calls
   - Keeping the wake/sleep word detection logic intact
   - Maintaining the same callback structure

## Technical Implementation

### Wake/Sleep Word Detection Algorithm

1. Continuous recognition is always active when listening
2. All speech is processed through the `onresult` event
3. Final results are checked for wake/sleep words
4. State management ensures transcription only happens when "active"
5. Wake word transitions from "waiting" → "active"
6. Sleep word transitions from "active" → "waiting"

### State Management

- `isListening`: Whether speech recognition is running
- `isActive`: Whether transcription should be captured (after wake word)
- `transcript`: Accumulated final transcriptions
- `interimTranscript`: Real-time, non-final speech preview

## Code Quality

- TypeScript for type safety
- React hooks for state management
- Modular, reusable architecture
- Clean separation of concerns
- Comprehensive error handling
- No external API dependencies for demo

## License

MIT
