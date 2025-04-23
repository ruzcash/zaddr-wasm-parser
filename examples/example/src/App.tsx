import { useEffect, useMemo, useState } from 'react'

import {
  is_valid_zcash_address,
  get_raw_zcash_address,
  parse_zcash_address,
  get_zcash_address_type,
  get_ua_receivers
} from '@elemental-zcash/zaddr-wasm-parser';

import './App.css'
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

function escapeHTML(str: string) { // @ts-expect-error FIXME LATER
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    "'": '&#39;', '"': '&quot;'
  }[tag]));
}

function copyToClipboard(text: string) {
  const tempInput = document.createElement("input");
  document.body.appendChild(tempInput);
  tempInput.value = text;
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  // if (btn) {
  //   const original = btn.textContent;
  //   btn.textContent = "Copied!";
  //   btn.disabled = true;
  //   setTimeout(() => {
  //     btn.textContent = original;
  //     btn.disabled = false;
  //   }, 1000);
  // }
}

function App() {
  const [address, setAddress] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [raw, setRaw] = useState('');
  const [ptr, setPtr] = useState(false);
  const [typ, setTyp] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    const main = async () => {
      // await init();
    };
    main();
  }, []);

  const receivers = useMemo(() => {
    try {
      return get_ua_receivers(address);
    } catch(err) {

    }
  }, [address]);

  useEffect(() => {
    const checkAddress = () => {
      // const receivers = get_ua_receivers(address);
      const addr = address;

      setIsValid(Boolean(is_valid_zcash_address(addr)));
  
  
      setRaw(get_raw_zcash_address(addr));
      setPtr(parse_zcash_address(addr));
      setTyp(get_zcash_address_type(addr))
  
      const label = {
        t: "🔍 Transparent",
        z: "🛡️ Sapling",
        u: "🌐 Unified",
        tex: "📈 TEX"  
      }[typ] || "❓ Unknown type";
  
      setLabel(label);
    }
    checkAddress();
  }, [address]);

  return (
    <>
      <div className="card">
        <div className="flex flex-row gap-3">
          <Input
            type="text"
            id="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Button onClick={() => setAddress('')}>
            🧹
          </Button>
        </div>
      </div>
      <Card className="text-start">
        <CardHeader>
          <CardTitle>UA Address Information</CardTitle>
          <CardDescription className={address && isValid ? "text-green-500" : "text-red-500"}>
            {(address && isValid)
              ? "✅ Address is valid"
              : "⚠️ Please enter a valid address to check."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Boolean(raw) && (
            <div className="mb-3">
              {"🔗 Normalized: "}
              <span className="break-words font-mono">{escapeHTML(raw)}</span>
            </div>
          )}
          {Boolean(label) && (
            <div>
              🏷️ Address type: ${label}
            </div>
          )}
          {typ === 'u' && (
            <div className="flex flex-col gap-4">
              <h3>📦 Parsing successful</h3>
              <span>This unified address contains:</span>
              {(Array.isArray(receivers) && receivers.length > 0) && receivers.map((r, i) => {
                const safeR = escapeHTML(r);
                const label = ['Orchard Address: ', 'Sapling Address: ', 'Transparent Address: '][i] || '';

                return (
                  <div className="flex flex-row gap-4 justify-between max-w-full text-start">
                    <span>{label}</span>
                    <span className="font-mono break-all flex-1">{safeR}</span>
                    <Button onClick={() => copyToClipboard(safeR)}>Copy</Button>
                  </div>
                )
              })}
              <div>
              </div>
            </div>
          )}
          {(!ptr && typ === "u") ? (
            <div>
              ⚠️ Parsing failed (unsupported format or error)
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}

export default App;
