
import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { Spinner } from './components/Spinner';
import { generateImage } from './services/geminiService';
import { SparklesIcon } from './components/Icons';
import { ApiAccessDisplay } from './components/ApiAccessDisplay';

const samplePhotoDataUri = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wgARCAQABAADAREAAhEBAxEB/8QAGwABAAMBAQEBAAAAAAAAAAAAAAECAwQFBgf/xAAaAQEBAQEBAQEAAAAAAAAAAAAAAQIDBAUG/9oADAMBAAIQAxAAAAH7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAAAAAAIAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAACAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAAAAACAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAIAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAACAAAAAAAAAAFABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAACAAAAAAAAAAFABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAIAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAACAAAAAAAAAAFABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAACAAAAAAAAAAFABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAIAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAACAAAAAAAAAAFABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAACAAAAAAAAAAFABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAIAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAACAAAAAAAAAAFABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAIAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAACAAAAAAAAAAFABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAIAAAAAAACgSgUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAEAAABQEoFAAAAAAAAAAAAAAAAAAAAAAolUAAAAAAABAAAAsEoFAAAAAAAAAAAAAAAAAAAABKJQAAAAAAQAAGCVQoAAAAAAAAAAAAAAAAAAAASgUAAAAAgAAYJQFAAAAAAAAAAAAAAAAAAAASgUAAAEAAABglUKAAAAAAAAAAAAAAAAAAAEoFAAAQAAAAwSoUAAAAAAAAAAAAAAAAAAAJQKAACAAAAAEMEqhQAAAAAAAAAAAAAAAAAABKBQAQAAAAAABDBKoUAAAAAAAAAAAAAAAAAAAEoFAIAAAAAAAEMPSoUAAAAAAAAAAAAAAAAAAAEoFCCAAAAAAAIYelQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAAhglUKAAAAAAAAAAAAAAAAAAAEoFAgAAAAAAACGCVQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAhh6VCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAAEMEqhQAAAAAAAAAAAAAAAAAASgUIAAAAAAAAhiUqFAAAAAAAAAAAAAAAAAAASgUIAAAAAAAAhglUKAAAAAAAAAAAAAAAAAAAEoFAgAAAAAAACGCVQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAhh6VCgAAAAAAAAAAAAAAAAABKBQgAAAAAAAAAEMPSoUAAAAAAAAAAAAAAAAAAAJQKEAAAAAAAAAEMPSoUAAAAAAAAAAAAAAAAAAAJQKEAAAAAAAAAhglUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYJVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAGGpUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYalQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAABhqVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAAMPSoUAAAAAAAAAAAAAAAAAAAJQKEAAAAAAAAAww9KhQAAAAAAAAAAAAAAAAAASgUIAAAAAAAABglUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAEMEqhQAAAAAAAAAAAAAAAAAASgUIAAAAAAAABglUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYJVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAAGGpUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYalQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAw1KgUAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAIYalQoAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAhhqVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAGGpUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYalQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAw1KhQAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAw1KhQAAAAAAAAAAAAAAAAAASgUIAAAAAAAABglUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYalQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAABhqVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAGGpUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYalQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAABhqVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAAGGpUoAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAwxKVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAAGEpUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYSlQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAwxKVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAGEpUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYSlQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAABhKVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAGEpUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYSlQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAwxKVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAAGEpUKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYSlQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAwxKVCgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAGFKlKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYalQoAAAAAAAAAAAAAAAAAAASgUIAAAAAAAAAw1KlKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAw1KlKAAAAAAAAAAAAAAAAAAAEoFCAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQgAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAAYalSlAAAAAAAAAAAAAAAAAAACUCggAAAAAAAAGGpUqUAAAAAAAAAAAAAAAAAAAJQKEAAAAAAAAAw1KlSgAAAAAAAAAAAAAAAAAABKBQggAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAAAAAAAAAAAAAAAAABKBQQgAAAAAAAAGFKlSgAAA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zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz-8-888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888-8Pzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz9/9/xAAsEQACAgECBQMEAwEBAQEAAAAAAREhMUFRYXEggaGxwfAQMEBQ0eFAYHCAkKCw/9oACAECAQE/EP8A+G1L/wD/xAAvEQAIBAgQDBwQCAwEAAAAAAAABEQIhMUFRYXGBkaGxwfAgMEBQ0eFAYHCAkKCw/9oACAEDAQE/EP8A+G1L/wD/2Q==";

type Provider = 'GEMINI' | 'SEGMIND' | 'API';

const ProviderSwitcher: React.FC<{ provider: Provider, setProvider: (p: Provider) => void }> = ({ provider, setProvider }) => {
  const labels: Record<Provider, string> = {
    GEMINI: 'Portrait Generation',
    SEGMIND: 'Face Swap',
    API: 'API Access',
  };

  return (
    <div className="flex justify-center items-center p-2 bg-gray-100 rounded-full mb-8 shadow-inner">
      {(['GEMINI', 'SEGMIND', 'API'] as Provider[]).map((p) => (
        <button 
          key={p} 
          onClick={() => setProvider(p)} 
          className={`w-1/3 text-center px-4 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out text-sm md:text-base ${provider === p 
            ? 'bg-white text-pink-600 shadow-md' 
            : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
          aria-pressed={provider === p}
        >
          {labels[p]}
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [provider, setProvider] = useState<Provider>('GEMINI');
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [targetImage, setTargetImage] = useState<File | null>(null);
  const [segmindApiKey, setSegmindApiKey] = useState<string>('');
  
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isSegmind = provider === 'SEGMIND';
  const isApiView = provider === 'API';
  
  const handleGenerate = useCallback(async () => {
    let validationError: string | null = null;
    if (isSegmind) {
      if (!sourceImage || !targetImage) validationError = 'Please upload both a source and a target image.';
      else if (!segmindApiKey.trim()) validationError = 'Please enter your Segmind API key.';
    } else {
      if (!sourceImage) validationError = 'Please upload a photo.';
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      let imageUrl: string;
      if (isSegmind) {
        if (sourceImage && targetImage) {
          imageUrl = await generateImage({ 
            provider: 'SEGMIND', 
            sourceImage: sourceImage, 
            targetImage: targetImage, 
            apiKey: segmindApiKey 
          });
        } else {
          throw new Error("Source or target image is missing.");
        }
      } else {
        if(sourceImage) {
            imageUrl = await generateImage({ provider: 'GEMINI', userImage: sourceImage });
        } else {
            throw new Error("Source image is missing.");
        }
      }
      setGeneratedImageUrl(imageUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [provider, sourceImage, targetImage, segmindApiKey, isSegmind]);

  const canGenerate = useMemo(() => {
    if (isLoading) return false;
    if (isSegmind) {
      return !!sourceImage && !!targetImage && !!segmindApiKey.trim();
    }
    return !!sourceImage;
  }, [isLoading, isSegmind, sourceImage, targetImage, segmindApiKey]);

  const resetForNewCreation = () => {
    setSourceImage(null);
    setTargetImage(null);
    setGeneratedImageUrl(null);
    setIsLoading(false);
    setError(null);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    resetForNewCreation();
  };
  
  let pageTitle: string;
  let mainTitle: string | null = null;
  let subTitle: string | null = null;

  if (isApiView) {
      pageTitle = "Developer API Access";
  } else if (isSegmind) {
      pageTitle = "AI Face Swap Tool";
      mainTitle = "Become the Bride with AI Face Swap";
      subTitle = "Upload two photos to swap the face from the source onto the target.";
  } else {
      pageTitle = "AI Bridal Portrait Generator";
      mainTitle = "Create Your Magical Bridal Portrait";
      subTitle = "Upload a photo of yourself and let our AI craft a stunning wedding photo.";
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header title={pageTitle} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-gray-200">
          
          <ProviderSwitcher provider={provider} setProvider={handleProviderChange} />
          
          {isApiView ? (
            <ApiAccessDisplay />
          ) : (
            <>
              {!generatedImageUrl && !isLoading && (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-700">{mainTitle}</h2>
                    <p className="text-gray-500 mt-2">{subTitle}</p>
                  </div>

                  {isSegmind && (
                    <div className="mb-6 animate-fade-in">
                      <label htmlFor="segmind-api-key" className="block text-sm font-medium text-gray-700 mb-1">
                        Segmind API Key <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="segmind-api-key"
                        value={segmindApiKey}
                        onChange={(e) => setSegmindApiKey(e.target.value)}
                        placeholder="Enter your temporary Segmind API key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        aria-required="true"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                    <ImageUploader 
                      id="source-photo" 
                      label={isSegmind ? "1. Upload Source Face" : "1. Upload Your Photo"} 
                      onImageSelect={setSourceImage}
                    />
                    
                    {isSegmind ? (
                      <ImageUploader 
                        id="target-photo" 
                        label="2. Upload Target Image" 
                        onImageSelect={setTargetImage}
                      />
                    ) : (
                      <div className="mt-4 md:mt-0">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
                          For Best Results...
                        </h3>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                          <img 
                              src={samplePhotoDataUri} 
                              alt="Sample of a good input photo" 
                              className="w-full h-auto object-cover rounded-md" 
                          />
                          <p className="text-sm text-gray-600 mt-3 text-center">
                              Use a clear, front-facing photo where your face is well-lit.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && <p className="text-center text-red-500 mt-6 mb-2">{error}</p>}

                  <div className="text-center mt-8">
                    <button
                      onClick={handleGenerate}
                      disabled={!canGenerate}
                      className="inline-flex items-center justify-center px-8 py-4 bg-pink-500 text-white font-bold rounded-full shadow-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
                      aria-label={isSegmind ? 'Swap Face and Create Portrait' : 'Generate Portrait'}
                    >
                      <SparklesIcon className="w-6 h-6 mr-3" />
                      {isSegmind ? 'Swap Face & Create Portrait' : 'Generate Portrait'}
                    </button>
                  </div>
                </>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Spinner />
                  <p className="text-lg text-gray-600 mt-4">Crafting your image... this may take a moment.</p>
                </div>
              )}

              {generatedImageUrl && (
                <GeneratedImageDisplay imageUrl={generatedImageUrl} onReset={resetForNewCreation} />
              )}
            </>
          )}

        </div>
      </main>
      <footer className="text-center py-6 text-gray-400 text-sm">
        <p>Powered by AI</p>
      </footer>
    </div>
  );
}
