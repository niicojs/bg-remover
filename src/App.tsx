import { useState, useCallback, useEffect } from 'react';
import { DownloadCloud } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import removeBackground from '@imgly/background-removal';

import { cn } from './lib/utils';
import { Button } from './components/ui/button';
import { ViewError } from './components/view-error';

type Img = File & { preview: string; working?: boolean; processed?: string };

function App() {
  const [files, setFiles] = useState<Img[]>([]);
  const [processing, setProcessing] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // heic & heic2any
    // preload from background-removal ?
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          working: false,
        })
      )
    );
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });
  useEffect(() => {
    return () =>
      files.forEach((file) => {
        URL.revokeObjectURL(file.preview);
        if (file.processed) {
          URL.revokeObjectURL(file.processed);
        }
      });
  }, []);

  const doTheThing = async () => {
    try {
      if (files) {
        for (const file of files) {
          setProcessing(file.name);
          const buffer = await file.arrayBuffer();
          const blob = await removeBackground(buffer, {
            output: {
              quality: 0.8,
              type: 'foreground',
              format: 'image/png',
            },
          });
          file.processed = URL.createObjectURL(blob);
          setProcessing(undefined);
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(e?.toString() || 'Unknown error');
      }
    } finally {
      setProcessing(undefined);
    }
  };

  return (
    <section className="container text-center mt-2 md:mt-10">
      <h1 className="font-bold text-xl uppercase">Background Remover</h1>
      <div
        className="mx-2 mt-5 md:mx-10 md:mt-10 p-5 border bg-slate-100 md:h-48 flex items-center text-slate-400"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="w-full text-balance">Drop the files here ...</p>
        ) : (
          <p className="w-full text-balance">
            Drag 'n' drop some files here, or click to select files
          </p>
        )}
      </div>
      <div>
        <Button
          className="my-10 uppercase"
          onClick={() => doTheThing()}
          disabled={!!processing}
        >
          Do The Thing!
        </Button>
      </div>
      {error ? (
        <div className="flex flex-wrap gap-2 justify-center">
          <ViewError error={error} className="mb-10 mx-2 md:mx-10 w-2/3 md:w-1/3" />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 justify-center">
        {files.map((img) => (
          <div
            key={img.name}
            className="p-2 border-2 border-solid border-black relative"
          >
            <img
              className="object-scale-down w-48 h-48"
              src={img.processed || img.preview}
            />
            <div
              className={cn(
                'absolute w-full h-full left-0 top-0 backdrop-filter backdrop-blur flex items-center justify-center white-shadow',
                { hidden: img.name !== processing }
              )}
            >
              processing...
            </div>
            <div
              className={cn('absolute right-2 bottom-2', {
                hidden: !img.processed,
              })}
            >
              <a href={img.processed} download={`nobg-${img.name}`}>
                <DownloadCloud className="w-5 h-5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default App;
