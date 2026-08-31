import { ElevenLabsClient } from 'elevenlabs';
import * as fs from 'fs';
import * as path from 'path';

/**
 * FineTune Launch Video — Voiceover Generation
 *
 * Uses ElevenLabs API to generate professional voiceover for each scene.
 * Run: npx tsx src/scripts/generate-voiceover.ts
 *
 * Requires ELEVENLABS_API_KEY environment variable.
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_e1bfc4022570bc489b513cf88aa51b5277362cc841880480';

// Voiceover script for each scene
const VOICEOVER_SCRIPT = [
  {
    scene: 'hook',
    text: 'Ever hummed a song you just couldn\'t find? That melody stuck in your head… but the name is gone.',
    filename: '01-hook.mp3',
  },
  {
    scene: 'reveal',
    text: 'Introducing FineTune. Hum it. Find it.',
    filename: '02-reveal.mp3',
  },
  {
    scene: 'demo',
    text: 'Just hum, sing, or whistle — FineTune identifies the song instantly across YouTube Music and Spotify. One hundred million songs. Found in seconds.',
    filename: '03-demo.mp3',
  },
  {
    scene: 'features',
    text: 'Stream on YouTube Music and Spotify. Sing karaoke with synchronized lyrics. Create fifteen-second video reels. In over twenty languages — from Hindi and Tamil to English.',
    filename: '04-features.mp3',
  },
  {
    scene: 'endcard',
    text: 'FineTune. Hum to discover any song. Try it free today.',
    filename: '05-endcard.mp3',
  },
];

// Voice selection — "Rachel" is a warm, professional female voice
// You can change this to any voice from your ElevenLabs voice library
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel
const MODEL_ID = 'eleven_multilingual_v2';

async function generateVoiceover() {
  console.log('🎙️  FineTune Launch Video — Voiceover Generator');
  console.log('━'.repeat(50));

  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY environment variable is required.');
    console.log('   Set it with: export ELEVENLABS_API_KEY=your_key');
    process.exit(1);
  }

  const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });

  const outputDir = path.join(process.cwd(), 'public', 'voiceover');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results: { scene: string; filename: string; duration: number }[] = [];

  for (const segment of VOICEOVER_SCRIPT) {
    console.log(`\n📝 Generating: ${segment.scene}`);
    console.log(`   Text: "${segment.text}"`);

    try {
      const audio = await client.textToSpeech.convert(
        VOICE_ID,
        {
          text: segment.text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
          },
        }
      );

      // Convert the audio stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of audio) {
        chunks.push(Buffer.from(chunk));
      }
      const audioBuffer = Buffer.concat(chunks);

      // Save to file
      const outputPath = path.join(outputDir, segment.filename);
      fs.writeFileSync(outputPath, audioBuffer);

      // Estimate duration from file size (MP3 ~128kbps)
      const estimatedDuration = audioBuffer.length / (128 * 1024 / 8);

      console.log(`   ✅ Saved: ${segment.filename} (${(audioBuffer.length / 1024).toFixed(1)} KB, ~${estimatedDuration.toFixed(1)}s)`);

      results.push({
        scene: segment.scene,
        filename: segment.filename,
        duration: estimatedDuration,
      });
    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);

      // Try with default voice as fallback
      try {
        console.log('   🔄 Trying with default voice...');
        const audio = await client.textToSpeech.convert(
          'pNInz6obpgDQGcFmaJgB', // Adam - default fallback
          {
            text: segment.text,
            model_id: MODEL_ID,
          }
        );

        const chunks: Buffer[] = [];
        for await (const chunk of audio) {
          chunks.push(Buffer.from(chunk));
        }
        const audioBuffer = Buffer.concat(chunks);

        const outputPath = path.join(outputDir, segment.filename);
        fs.writeFileSync(outputPath, audioBuffer);

        const estimatedDuration = audioBuffer.length / (128 * 1024 / 8);
        console.log(`   ✅ Saved with fallback voice: ${segment.filename} (~${estimatedDuration.toFixed(1)}s)`);

        results.push({
          scene: segment.scene,
          filename: segment.filename,
          duration: estimatedDuration,
        });
      } catch (fallbackError: any) {
        console.error(`   ❌ Fallback also failed: ${fallbackError.message}`);
      }
    }
  }

  // Print summary
  console.log('\n' + '━'.repeat(50));
  console.log('📊 Generation Summary');
  console.log('━'.repeat(50));

  let totalDuration = 0;
  for (const r of results) {
    console.log(`   ${r.scene.padEnd(12)} → ${r.filename} (~${r.duration.toFixed(1)}s)`);
    totalDuration += r.duration;
  }

  console.log('━'.repeat(50));
  console.log(`   Total estimated duration: ~${totalDuration.toFixed(1)}s`);
  console.log(`   Output directory: ${outputDir}`);

  // Write manifest for Remotion to consume
  const manifest = {
    generatedAt: new Date().toISOString(),
    voiceId: VOICE_ID,
    modelId: MODEL_ID,
    totalDuration,
    segments: results,
  };

  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`   Manifest: ${path.join(outputDir, 'manifest.json')}`);
  console.log('\n✨ Done! Voiceover files ready for Remotion composition.');
}

generateVoiceover().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
