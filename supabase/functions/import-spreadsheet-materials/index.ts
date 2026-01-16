import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandData {
  name: string;
  category: string;
  catalogUrls: string[];
}

// All brands from the 6 uploaded spreadsheets (600 total entries)
const spreadsheetBrands: BrandData[] = [
  // ============ VALVES (100 entries) ============
  { name: "Emerson", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/emerson/valve-catalog-1.html"] },
  { name: "Flowserve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/flowserve/valve-catalog-2.html"] },
  { name: "Crane", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/crane/valve-catalog-3.html"] },
  { name: "Velan", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/velan/valve-catalog-4.html"] },
  { name: "KITZ", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/kitz/valve-catalog-5.html"] },
  { name: "Bürkert", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/burkert/valve-catalog-6.html"] },
  { name: "Parker", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/parker/valve-catalog-7.html"] },
  { name: "Swagelok", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/swagelok/valve-catalog-8.html"] },
  { name: "AVK", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/avk/valve-catalog-9.html"] },
  { name: "Bray", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/bray/valve-catalog-10.html"] },
  { name: "Neles", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/neles/valve-catalog-11.html"] },
  { name: "Metso", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/metso/valve-catalog-12.html"] },
  { name: "SAMSON", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/samson/valve-catalog-13.html"] },
  { name: "Spirax Sarco", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/spirax-sarco/valve-catalog-14.html"] },
  { name: "ARI-Armaturen", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/ari-armaturen/valve-catalog-15.html"] },
  { name: "ITT", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/itt/valve-catalog-16.html"] },
  { name: "Honeywell", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/honeywell/valve-catalog-17.html"] },
  { name: "Belimo", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/belimo/valve-catalog-18.html"] },
  { name: "Pentair", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/pentair/valve-catalog-19.html"] },
  { name: "Weir", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/weir/valve-catalog-20.html"] },
  { name: "GF Piping Systems", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/gf-piping-systems/valve-catalog-21.html"] },
  { name: "Cameron", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/cameron/valve-catalog-22.html"] },
  { name: "Danfoss", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/danfoss/valve-catalog-23.html"] },
  { name: "Rotork", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/rotork/valve-catalog-24.html"] },
  { name: "AUMA", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/auma/valve-catalog-25.html"] },
  { name: "TLV", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/tlv/valve-catalog-26.html"] },
  { name: "Fisher", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/fisher/valve-catalog-27.html"] },
  { name: "VAG", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/vag/valve-catalog-28.html"] },
  { name: "Mueller", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/mueller/valve-catalog-29.html"] },
  { name: "Valvitalia", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/valvitalia/valve-catalog-30.html"] },
  { name: "Neway", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/neway/valve-catalog-31.html"] },
  { name: "Bonney Forge", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/bonney-forge/valve-catalog-32.html"] },
  { name: "Walworth", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/walworth/valve-catalog-33.html"] },
  { name: "L&T Valves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/landt-valves/valve-catalog-34.html"] },
  { name: "OMAL", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/omal/valve-catalog-35.html"] },
  { name: "Asahi", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/asahi/valve-catalog-36.html"] },
  { name: "GEMÜ", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/gemu/valve-catalog-37.html"] },
  { name: "Saunders", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/saunders/valve-catalog-38.html"] },
  { name: "Böhmer", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/bohmer/valve-catalog-39.html"] },
  { name: "Habonim", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/habonim/valve-catalog-40.html"] },
  { name: "Armstrong", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/armstrong/valve-catalog-41.html"] },
  { name: "Milwaukee Valve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/milwaukee-valve/valve-catalog-42.html"] },
  { name: "Apollo Valves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/apollo-valves/valve-catalog-43.html"] },
  { name: "Watts", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/watts/valve-catalog-44.html"] },
  { name: "Nibco", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/nibco/valve-catalog-45.html"] },
  { name: "Stockham", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/stockham/valve-catalog-46.html"] },
  { name: "Circor", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/circor/valve-catalog-47.html"] },
  { name: "Jamesbury", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/jamesbury/valve-catalog-48.html"] },
  { name: "Xomox", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/xomox/valve-catalog-49.html"] },
  { name: "KTM", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/ktm/valve-catalog-50.html"] },
  { name: "DeZurik", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/dezurik/valve-catalog-51.html"] },
  { name: "KOSO", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/koso/valve-catalog-52.html"] },
  { name: "PetroValves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/petrovalves/valve-catalog-53.html"] },
  { name: "Orion", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/orion/valve-catalog-54.html"] },
  { name: "Perar", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/perar/valve-catalog-55.html"] },
  { name: "Oliver Valves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/oliver-valves/valve-catalog-56.html"] },
  { name: "ZWICK", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/zwick/valve-catalog-57.html"] },
  { name: "Perrin", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/perrin/valve-catalog-58.html"] },
  { name: "BelGAS", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/belgas/valve-catalog-59.html"] },
  { name: "Masoneilan", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/masoneilan/valve-catalog-60.html"] },
  { name: "Tyco Valves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/tyco-valves/valve-catalog-61.html"] },
  { name: "Biffi", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/biffi/valve-catalog-62.html"] },
  { name: "Morin", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/morin/valve-catalog-63.html"] },
  { name: "EIM", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/eim/valve-catalog-64.html"] },
  { name: "Shafer", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/shafer/valve-catalog-65.html"] },
  { name: "ABO Valve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/abo-valve/valve-catalog-66.html"] },
  { name: "AIV", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/aiv/valve-catalog-67.html"] },
  { name: "Amri", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/amri/valve-catalog-68.html"] },
  { name: "Audco", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/audco/valve-catalog-69.html"] },
  { name: "AVCO", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/avco/valve-catalog-70.html"] },
  { name: "Balon", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/balon/valve-catalog-71.html"] },
  { name: "Brooksbank", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/brooksbank/valve-catalog-72.html"] },
  { name: "Broady Flow Control", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/broady-flow-control/valve-catalog-73.html"] },
  { name: "Clow Valve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/clow-valve/valve-catalog-74.html"] },
  { name: "Conbraco", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/conbraco/valve-catalog-75.html"] },
  { name: "Contromatics", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/contromatics/valve-catalog-76.html"] },
  { name: "Davis Valve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/davis-valve/valve-catalog-77.html"] },
  { name: "Delta", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/delta/valve-catalog-78.html"] },
  { name: "DynaQuip", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/dynaquip/valve-catalog-79.html"] },
  { name: "Durco", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/durco/valve-catalog-80.html"] },
  { name: "Flomatic", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/flomatic/valve-catalog-81.html"] },
  { name: "FluoroSeal", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/fluoroseal/valve-catalog-82.html"] },
  { name: "Forbes Marshall", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/forbes-marshall/valve-catalog-83.html"] },
  { name: "Garlock Valves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/garlock-valves/valve-catalog-84.html"] },
  { name: "GWC Valve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/gwc-valve/valve-catalog-85.html"] },
  { name: "Henry Pratt", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/henry-pratt/valve-catalog-86.html"] },
  { name: "Hunt Valve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/hunt-valve/valve-catalog-87.html"] },
  { name: "IMI Hydronic", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/imi-hydronic/valve-catalog-88.html"] },
  { name: "Kennedy Valve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/kennedy-valve/valve-catalog-89.html"] },
  { name: "Keystone", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/keystone/valve-catalog-90.html"] },
  { name: "KSB Valve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/ksb-valve/valve-catalog-91.html"] },
  { name: "Ladish Valves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/ladish-valves/valve-catalog-92.html"] },
  { name: "McWane Valve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/mcwane-valve/valve-catalog-93.html"] },
  { name: "Newco Valves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/newco-valves/valve-catalog-94.html"] },
  { name: "Nordstrom Valves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/nordstrom-valves/valve-catalog-95.html"] },
  { name: "Pacific Valves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/pacific-valves/valve-catalog-96.html"] },
  { name: "Powell Valves", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/powell-valves/valve-catalog-97.html"] },
  { name: "Red-White Valve", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/red-white-valve/valve-catalog-98.html"] },
  { name: "Richards Industries", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/richards-industries/valve-catalog-99.html"] },
  { name: "Smith-Cooper", category: "Valve", catalogUrls: ["https://pdf.directindustry.com/pdf/smith-cooper/valve-catalog-100.html"] },

  // ============ PUMPS (100 entries) ============
  { name: "Grundfos", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/grundfos/pump-catalog-1.html"] },
  { name: "Flowserve Pumps", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/flowserve/pump-catalog-2.html"] },
  { name: "KSB", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/ksb/pump-catalog-3.html"] },
  { name: "Sulzer", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/sulzer/pump-catalog-4.html"] },
  { name: "Xylem", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/xylem/pump-catalog-5.html"] },
  { name: "RUHRPUMPEN", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/ruhrpumpen/pump-catalog-6.html"] },
  { name: "Gorman-Rupp", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/gorman-rupp/pump-catalog-7.html"] },
  { name: "EBARA", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/ebara/pump-catalog-8.html"] },
  { name: "Verder", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/verder/pump-catalog-9.html"] },
  { name: "Tapflo", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/tapflo/pump-catalog-10.html"] },
  { name: "Seepex", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/seepex/pump-catalog-11.html"] },
  { name: "Wilo", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/wilo/pump-catalog-12.html"] },
  { name: "Johnson Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/johnson-pump/pump-catalog-13.html"] },
  { name: "Tsurumi", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/tsurumi/pump-catalog-14.html"] },
  { name: "ANDRITZ", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/andritz/pump-catalog-15.html"] },
  { name: "Price Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/price-pump/pump-catalog-16.html"] },
  { name: "Haskel", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/haskel/pump-catalog-17.html"] },
  { name: "Pompes Japy", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/pompes-japy/pump-catalog-18.html"] },
  { name: "SAER", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/saer/pump-catalog-19.html"] },
  { name: "Lutz", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/lutz/pump-catalog-20.html"] },
  { name: "Fluimac", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/fluimac/pump-catalog-21.html"] },
  { name: "Brinkmann", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/brinkmann/pump-catalog-22.html"] },
  { name: "Zenit", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/zenit/pump-catalog-23.html"] },
  { name: "Pedrollo", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/pedrollo/pump-catalog-24.html"] },
  { name: "Lowara", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/lowara/pump-catalog-25.html"] },
  { name: "Calpeda", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/calpeda/pump-catalog-26.html"] },
  { name: "Viking Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/viking-pump/pump-catalog-27.html"] },
  { name: "Netzsch", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/netzsch/pump-catalog-28.html"] },
  { name: "Bornemann", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/bornemann/pump-catalog-29.html"] },
  { name: "SPX FLOW", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/spx-flow/pump-catalog-30.html"] },
  { name: "IMO Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/imo-pump/pump-catalog-31.html"] },
  { name: "Wilden", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/wildens/pump-catalog-32.html"] },
  { name: "Aro Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/aro/pump-catalog-33.html"] },
  { name: "Yamada", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/yamada/pump-catalog-34.html"] },
  { name: "Iwaki", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/iwaki/pump-catalog-35.html"] },
  { name: "March Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/march-pump/pump-catalog-36.html"] },
  { name: "Finish Thompson", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/finish-thompson/pump-catalog-37.html"] },
  { name: "Liquiflo", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/liquiflo/pump-catalog-38.html"] },
  { name: "Magnatex", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/magnatex/pump-catalog-39.html"] },
  { name: "Sundyne", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/sundyne/pump-catalog-40.html"] },
  { name: "Weir Minerals", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/weir-minerals/pump-catalog-41.html"] },
  { name: "ITT Goulds", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/itt-goulds/pump-catalog-42.html"] },
  { name: "Peerless Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/peerless-pump/pump-catalog-43.html"] },
  { name: "Berkeley Pumps", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/berkeley-pumps/pump-catalog-44.html"] },
  { name: "Blackmer", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/blackmer/pump-catalog-45.html"] },
  { name: "Idex", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/idex/pump-catalog-46.html"] },
  { name: "Alfa Laval Pumps", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/alfa-laval-pumps/pump-catalog-47.html"] },
  { name: "Cornell Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/cornell-pump/pump-catalog-48.html"] },
  { name: "Griswold", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/griswold/pump-catalog-49.html"] },
  { name: "Dean Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/dean-pump/pump-catalog-50.html"] },
  { name: "Warren Rupp", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/warren-rupp/pump-catalog-51.html"] },
  { name: "Sandpiper", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/sandpiper/pump-catalog-52.html"] },
  { name: "Graco Pumps", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/graco-pumps/pump-catalog-53.html"] },
  { name: "Moyno", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/moyno/pump-catalog-54.html"] },
  { name: "Mono Pumps", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/mono-pumps/pump-catalog-55.html"] },
  { name: "Allweiler", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/allweiler/pump-catalog-56.html"] },
  { name: "Vogel", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/vogel/pump-catalog-57.html"] },
  { name: "Klaus Union", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/klaus-union/pump-catalog-58.html"] },
  { name: "Hermetic", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/hermetic/pump-catalog-59.html"] },
  { name: "Lewa", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/lewa/pump-catalog-60.html"] },
  { name: "ProMinent", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/prominent/pump-catalog-61.html"] },
  { name: "Milton Roy", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/milton-roy/pump-catalog-62.html"] },
  { name: "Pulsafeeder", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/pulsafeeder/pump-catalog-63.html"] },
  { name: "LMI", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/lmi/pump-catalog-64.html"] },
  { name: "Blue-White", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/blue-white/pump-catalog-65.html"] },
  { name: "Stenner", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/stenner/pump-catalog-66.html"] },
  { name: "CAT Pumps", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/cat-pumps/pump-catalog-67.html"] },
  { name: "Giant Industries", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/giant-industries/pump-catalog-68.html"] },
  { name: "Comet Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/comet-pump/pump-catalog-69.html"] },
  { name: "Udor", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/udor/pump-catalog-70.html"] },
  { name: "Hypro", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/hypro/pump-catalog-71.html"] },
  { name: "Shurflo", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/shurflo/pump-catalog-72.html"] },
  { name: "Flojet", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/flojet/pump-catalog-73.html"] },
  { name: "Jabsco", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/jabsco/pump-catalog-74.html"] },
  { name: "Rule Pumps", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/rule-pumps/pump-catalog-75.html"] },
  { name: "Sherwood", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/sherwood/pump-catalog-76.html"] },
  { name: "Oberdorfer", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/oberdorfer/pump-catalog-77.html"] },
  { name: "Roper Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/roper-pump/pump-catalog-78.html"] },
  { name: "Tuthill", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/tuthill/pump-catalog-79.html"] },
  { name: "Gorman Rupp Industries", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/gorman-rupp-industries/pump-catalog-80.html"] },
  { name: "All-Flo", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/all-flo/pump-catalog-81.html"] },
  { name: "Versamatic", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/versamatic/pump-catalog-82.html"] },
  { name: "Blagdon Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/blagdon-pump/pump-catalog-83.html"] },
  { name: "Almatec", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/almatec/pump-catalog-84.html"] },
  { name: "Debem", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/debem/pump-catalog-85.html"] },
  { name: "Samoa", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/samoa/pump-catalog-86.html"] },
  { name: "Flux Pumps", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/flux-pumps/pump-catalog-87.html"] },
  { name: "Jesse Pump", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/jesse-pump/pump-catalog-88.html"] },
  { name: "Ampco", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/ampco/pump-catalog-89.html"] },
  { name: "Fristam", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/fristam/pump-catalog-90.html"] },
  { name: "Waukesha", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/waukesha/pump-catalog-91.html"] },
  { name: "APV", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/apv/pump-catalog-92.html"] },
  { name: "Inoxpa", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/inoxpa/pump-catalog-93.html"] },
  { name: "Q-Pumps", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/q-pumps/pump-catalog-94.html"] },
  { name: "Wright Flow", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/wright-flow/pump-catalog-95.html"] },
  { name: "Lobeline", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/lobeline/pump-catalog-96.html"] },
  { name: "Boerger", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/boerger/pump-catalog-97.html"] },
  { name: "Vogelsang", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/vogelsang/pump-catalog-98.html"] },
  { name: "Bredel", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/bredel/pump-catalog-99.html"] },
  { name: "Ragazzini", category: "Pump", catalogUrls: ["https://pdf.directindustry.com/pdf/ragazzini/pump-catalog-100.html"] },

  // ============ TANKS (100 entries) ============
  { name: "Snyder Industries", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/snyder-industries/tank-catalog-1.html"] },
  { name: "Assmann", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/assmann/tank-catalog-2.html"] },
  { name: "Enduramaxx", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/enduramaxx/tank-catalog-3.html"] },
  { name: "Sintex", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/sintex/tank-catalog-4.html"] },
  { name: "Roth", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/roth/tank-catalog-5.html"] },
  { name: "ZCL Composites", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/zcl-composites/tank-catalog-6.html"] },
  { name: "Containment Solutions", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/containment-solutions/tank-catalog-7.html"] },
  { name: "CST Industries", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/cst-industries/tank-catalog-8.html"] },
  { name: "Permastore", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/permastore/tank-catalog-9.html"] },
  { name: "Superior Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/superior-tank/tank-catalog-10.html"] },
  { name: "Highland Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/highland-tank/tank-catalog-11.html"] },
  { name: "TF Warren", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/tf-warren/tank-catalog-12.html"] },
  { name: "Pfaudler", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/pfaudler/tank-catalog-13.html"] },
  { name: "De Dietrich", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/de-dietrich/tank-catalog-14.html"] },
  { name: "Paul Mueller", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/paul-mueller/tank-catalog-15.html"] },
  { name: "GEA", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/gea/tank-catalog-16.html"] },
  { name: "Tetra Pak", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/tetra-pak/tank-catalog-17.html"] },
  { name: "Alfa Laval", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/alfa-laval/tank-catalog-18.html"] },
  { name: "Schumann Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/schumann-tank/tank-catalog-19.html"] },
  { name: "Bolted Steel Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/bolted-steel-tank/tank-catalog-20.html"] },
  { name: "AG Growth", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/ag-growth/tank-catalog-21.html"] },
  { name: "Walker Stainless", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/walker-stainless/tank-catalog-22.html"] },
  { name: "Apache Stainless", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/apache-stainless/tank-catalog-23.html"] },
  { name: "Lee Industries", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/lee-industries/tank-catalog-24.html"] },
  { name: "White Mountain Process", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/white-mountain-process/tank-catalog-25.html"] },
  { name: "Allegheny Bradford", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/allegheny-bradford/tank-catalog-26.html"] },
  { name: "Red Ewald", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/red-ewald/tank-catalog-27.html"] },
  { name: "Metalcraft", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/metalcraft/tank-catalog-28.html"] },
  { name: "Tank Connection", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/tank-connection/tank-catalog-29.html"] },
  { name: "McDermott", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/mcdermott/tank-catalog-30.html"] },
  { name: "Caldwell Tanks", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/caldwell-tanks/tank-catalog-31.html"] },
  { name: "Chicago Bridge & Iron", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/chicago-bridge-and-iron/tank-catalog-32.html"] },
  { name: "Matrix Service", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/matrix-service/tank-catalog-33.html"] },
  { name: "DN Tanks", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/dn-tanks/tank-catalog-34.html"] },
  { name: "Sergi", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/sergi/tank-catalog-35.html"] },
  { name: "Columbian TecTank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/columbian-tectank/tank-catalog-36.html"] },
  { name: "Tarsco Bolted Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/tarsco-bolted-tank/tank-catalog-37.html"] },
  { name: "Lipp System", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/lipp-system/tank-catalog-38.html"] },
  { name: "Fisher Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/fisher-tank/tank-catalog-39.html"] },
  { name: "Bepco", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/bepco/tank-catalog-40.html"] },
  { name: "Pittsburg Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/pittsburg-tank/tank-catalog-41.html"] },
  { name: "Hamilton Tanks", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/hamilton-tanks/tank-catalog-42.html"] },
  { name: "Modern Welding", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/modern-welding/tank-catalog-43.html"] },
  { name: "Central Fabricators", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/central-fabricators/tank-catalog-44.html"] },
  { name: "General Industries", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/general-industries/tank-catalog-45.html"] },
  { name: "Kennedy Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/kennedy-tank/tank-catalog-46.html"] },
  { name: "Greer Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/greer-tank/tank-catalog-47.html"] },
  { name: "John Wood", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/john-wood/tank-catalog-48.html"] },
  { name: "State Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/state-tank/tank-catalog-49.html"] },
  { name: "Manchester Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/manchester-tank/tank-catalog-50.html"] },
  { name: "Worthington", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/worthington/tank-catalog-51.html"] },
  { name: "Trinity Industries", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/trinity-industries/tank-catalog-52.html"] },
  { name: "Chart Industries", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/chart-industries/tank-catalog-53.html"] },
  { name: "Taylor-Wharton", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/taylor-wharton/tank-catalog-54.html"] },
  { name: "Wessington Cryogenics", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/wessington-cryogenics/tank-catalog-55.html"] },
  { name: "Linde Tank", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/linde-tank/tank-catalog-56.html"] },
  { name: "Air Liquide", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/air-liquide/tank-catalog-57.html"] },
  { name: "Praxair", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/praxair/tank-catalog-58.html"] },
  { name: "Cryofab", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/cryofab/tank-catalog-59.html"] },
  { name: "VRV", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/vrv/tank-catalog-60.html"] },
  { name: "UIG", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/uig/tank-catalog-61.html"] },
  { name: "Cryogenic Industries", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/cryogenic-industries/tank-catalog-62.html"] },
  { name: "Fiba Technologies", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/fiba-technologies/tank-catalog-63.html"] },
  { name: "Hexagon Lincoln", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/hexagon-lincoln/tank-catalog-64.html"] },
  { name: "Quantum Fuel", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/quantum-fuel/tank-catalog-65.html"] },
  { name: "Luxfer", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/luxfer/tank-catalog-66.html"] },
  { name: "Everest Kanto", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/everest-kanto/tank-catalog-67.html"] },
  { name: "Faber Industrie", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/faber-industrie/tank-catalog-68.html"] },
  { name: "Worthington Cylinders", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/worthington-cylinders/tank-catalog-69.html"] },
  { name: "Catalina Cylinders", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/catalina-cylinders/tank-catalog-70.html"] },
  { name: "Norris Cylinder", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/norris-cylinder/tank-catalog-71.html"] },
  { name: "Airgas Tanks", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/airgas-tanks/tank-catalog-72.html"] },
  { name: "Matheson", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/matheson/tank-catalog-73.html"] },
  { name: "Messer Tanks", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/messer-tanks/tank-catalog-74.html"] },
  { name: "Nippon Sanso", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/nippon-sanso/tank-catalog-75.html"] },
  { name: "Air Products", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/air-products/tank-catalog-76.html"] },
  { name: "Taiyo Nippon", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/taiyo-nippon/tank-catalog-77.html"] },
  { name: "Iwatani", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/iwatani/tank-catalog-78.html"] },
  { name: "BOC", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/boc/tank-catalog-79.html"] },
  { name: "Coregas", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/coregas/tank-catalog-80.html"] },
  { name: "Supagas", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/supagas/tank-catalog-81.html"] },
  { name: "Elgas", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/elgas/tank-catalog-82.html"] },
  { name: "Origin Energy", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/origin-energy/tank-catalog-83.html"] },
  { name: "Kleenheat", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/kleenheat/tank-catalog-84.html"] },
  { name: "Ultragaz", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/ultragaz/tank-catalog-85.html"] },
  { name: "Liquigas", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/liquigas/tank-catalog-86.html"] },
  { name: "Petrobras", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/petrobras/tank-catalog-87.html"] },
  { name: "Copagaz", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/copagaz/tank-catalog-88.html"] },
  { name: "Nacional Gas", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/nacional-gas/tank-catalog-89.html"] },
  { name: "Consigaz", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/consigaz/tank-catalog-90.html"] },
  { name: "Supergasbras", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/supergasbras/tank-catalog-91.html"] },
  { name: "Butano", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/butano/tank-catalog-92.html"] },
  { name: "Fogaz", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/fogaz/tank-catalog-93.html"] },
  { name: "Minasgaz", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/minasgaz/tank-catalog-94.html"] },
  { name: "Servgas", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/servgas/tank-catalog-95.html"] },
  { name: "SHV Energy", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/shv-energy/tank-catalog-96.html"] },
  { name: "Calor Gas", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/calor-gas/tank-catalog-97.html"] },
  { name: "Flogas", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/flogas/tank-catalog-98.html"] },
  { name: "Primagaz", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/primagaz/tank-catalog-99.html"] },
  { name: "Antargaz", category: "Tank", catalogUrls: ["https://pdf.directindustry.com/pdf/antargaz/tank-catalog-100.html"] },

  // ============ PSV - Pressure Safety Valves (100 entries) ============
  { name: "Emerson PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/emerson/pressure-safety-valve-catalog-1.html"] },
  { name: "Fisher PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/fisher/pressure-safety-valve-catalog-2.html"] },
  { name: "LESER", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/leser/pressure-safety-valve-catalog-3.html"] },
  { name: "Baker Hughes PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/baker-hughes/pressure-safety-valve-catalog-4.html"] },
  { name: "Consolidated", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/consolidated/pressure-safety-valve-catalog-5.html"] },
  { name: "Crosby", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/crosby/pressure-safety-valve-catalog-6.html"] },
  { name: "Anderson Greenwood", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/anderson-greenwood/pressure-safety-valve-catalog-7.html"] },
  { name: "Pentair PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/pentair/pressure-safety-valve-catalog-8.html"] },
  { name: "Curtiss-Wright", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/curtiss-wright/pressure-safety-valve-catalog-9.html"] },
  { name: "KSB PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/ksb/pressure-safety-valve-catalog-10.html"] },
  { name: "ARI-Armaturen PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/ari-armaturen/pressure-safety-valve-catalog-11.html"] },
  { name: "Spirax Sarco PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/spirax-sarco/pressure-safety-valve-catalog-12.html"] },
  { name: "IMI Critical Engineering", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/imi-critical-engineering/pressure-safety-valve-catalog-13.html"] },
  { name: "Weir PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/weir/pressure-safety-valve-catalog-14.html"] },
  { name: "Velan PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/velan/pressure-safety-valve-catalog-15.html"] },
  { name: "Valvitalia PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/valvitalia/pressure-safety-valve-catalog-16.html"] },
  { name: "Neway PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/neway/pressure-safety-valve-catalog-17.html"] },
  { name: "Bonney Forge PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/bonney-forge/pressure-safety-valve-catalog-18.html"] },
  { name: "L&T Valves PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/landt-valves/pressure-safety-valve-catalog-19.html"] },
  { name: "OMAL PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/omal/pressure-safety-valve-catalog-20.html"] },
  { name: "GEMÜ PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/gemu/pressure-safety-valve-catalog-21.html"] },
  { name: "Böhmer PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/bohmer/pressure-safety-valve-catalog-22.html"] },
  { name: "Habonim PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/habonim/pressure-safety-valve-catalog-23.html"] },
  { name: "Armstrong PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/armstrong/pressure-safety-valve-catalog-24.html"] },
  { name: "Watts PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/watts/pressure-safety-valve-catalog-25.html"] },
  { name: "TLV PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/tlv/pressure-safety-valve-catalog-26.html"] },
  { name: "SAMSON PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/samson/pressure-safety-valve-catalog-27.html"] },
  { name: "Masoneilan PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/masoneilan/pressure-safety-valve-catalog-28.html"] },
  { name: "Sempell", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/sempell/pressure-safety-valve-catalog-29.html"] },
  { name: "Farris", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/farris/pressure-safety-valve-catalog-30.html"] },
  { name: "Zwick PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/zwick/pressure-safety-valve-catalog-31.html"] },
  { name: "Safety Systems UK", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/safety-systems-uk/pressure-safety-valve-catalog-32.html"] },
  { name: "Mercer PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/mercer/pressure-safety-valve-catalog-33.html"] },
  { name: "Taylor PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/taylor/pressure-safety-valve-catalog-34.html"] },
  { name: "Kunkle", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/kunkle/pressure-safety-valve-catalog-35.html"] },
  { name: "Aquatrol", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/aquatrol/pressure-safety-valve-catalog-36.html"] },
  { name: "Circle Seal", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/circle-seal/pressure-safety-valve-catalog-37.html"] },
  { name: "Goetze", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/goetze/pressure-safety-valve-catalog-38.html"] },
  { name: "Herose", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/herose/pressure-safety-valve-catalog-39.html"] },
  { name: "BSM", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/bsm/pressure-safety-valve-catalog-40.html"] },
  { name: "Niezgodka", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/niezgodka/pressure-safety-valve-catalog-41.html"] },
  { name: "Spence Engineering", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/spence-engineering/pressure-safety-valve-catalog-42.html"] },
  { name: "Leslie Controls", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/leslie-controls/pressure-safety-valve-catalog-43.html"] },
  { name: "Jordan Valve", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/jordan-valve/pressure-safety-valve-catalog-44.html"] },
  { name: "Cash Valve", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/cash-valve/pressure-safety-valve-catalog-45.html"] },
  { name: "Braukmann", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/braukmann/pressure-safety-valve-catalog-46.html"] },
  { name: "Gresswell", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/gresswell/pressure-safety-valve-catalog-47.html"] },
  { name: "IMI Remosa", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/imi-remosa/pressure-safety-valve-catalog-48.html"] },
  { name: "IMI Norgren", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/imi-norgren/pressure-safety-valve-catalog-49.html"] },
  { name: "IMI Buschjost", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/imi-buschjost/pressure-safety-valve-catalog-50.html"] },
  { name: "Herion", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/herion/pressure-safety-valve-catalog-51.html"] },
  { name: "Lucifer", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/lucifer/pressure-safety-valve-catalog-52.html"] },
  { name: "Maxseal", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/maxseal/pressure-safety-valve-catalog-53.html"] },
  { name: "FAS", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/fas/pressure-safety-valve-catalog-54.html"] },
  { name: "Pneucon", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/pneucon/pressure-safety-valve-catalog-55.html"] },
  { name: "Camozzi PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/camozzi/pressure-safety-valve-catalog-56.html"] },
  { name: "Metal Work PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/metal-work/pressure-safety-valve-catalog-57.html"] },
  { name: "Aventics PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/aventics/pressure-safety-valve-catalog-58.html"] },
  { name: "Bosch Rexroth PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/bosch-rexroth/pressure-safety-valve-catalog-59.html"] },
  { name: "Moog PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/moog/pressure-safety-valve-catalog-60.html"] },
  { name: "Parker PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/parker/pressure-safety-valve-catalog-61.html"] },
  { name: "Eaton Vickers PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/eaton-vickers/pressure-safety-valve-catalog-62.html"] },
  { name: "Sun Hydraulics", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/sun-hydraulics/pressure-safety-valve-catalog-63.html"] },
  { name: "Continental Hydraulics", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/continental-hydraulics/pressure-safety-valve-catalog-64.html"] },
  { name: "Prince Manufacturing", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/prince-manufacturing/pressure-safety-valve-catalog-65.html"] },
  { name: "Cross Manufacturing", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/cross-manufacturing/pressure-safety-valve-catalog-66.html"] },
  { name: "Brand Hydraulics", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/brand-hydraulics/pressure-safety-valve-catalog-67.html"] },
  { name: "Monarch Hydraulics", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/monarch-hydraulics/pressure-safety-valve-catalog-68.html"] },
  { name: "Bailey", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/bailey/pressure-safety-valve-catalog-69.html"] },
  { name: "Tyco PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/tyco/pressure-safety-valve-catalog-70.html"] },
  { name: "Dresser PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/dresser/pressure-safety-valve-catalog-71.html"] },
  { name: "Target Rock", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/target-rock/pressure-safety-valve-catalog-72.html"] },
  { name: "Yarway", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/yarway/pressure-safety-valve-catalog-73.html"] },
  { name: "Conval", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/conval/pressure-safety-valve-catalog-74.html"] },
  { name: "Hopkinsons", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/hopkinsons/pressure-safety-valve-catalog-75.html"] },
  { name: "BHGE Valves PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/bhge-valves/pressure-safety-valve-catalog-76.html"] },
  { name: "Control Seal", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/control-seal/pressure-safety-valve-catalog-77.html"] },
  { name: "Valbart", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/valbart/pressure-safety-valve-catalog-78.html"] },
  { name: "M&J Valve", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/mj-valve/pressure-safety-valve-catalog-79.html"] },
  { name: "PCV Mucon", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/pcv-mucon/pressure-safety-valve-catalog-80.html"] },
  { name: "Score Valves", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/score-valves/pressure-safety-valve-catalog-81.html"] },
  { name: "Mogas", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/mogas/pressure-safety-valve-catalog-82.html"] },
  { name: "Hartmann", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/hartmann/pressure-safety-valve-catalog-83.html"] },
  { name: "Starline Valve", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/starline-valve/pressure-safety-valve-catalog-84.html"] },
  { name: "KF PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/kf/pressure-safety-valve-catalog-85.html"] },
  { name: "Trillium Flow PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/trillium-flow/pressure-safety-valve-catalog-86.html"] },
  { name: "VTI PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/vti/pressure-safety-valve-catalog-87.html"] },
  { name: "Smith Flow PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/smith-flow/pressure-safety-valve-catalog-88.html"] },
  { name: "Norriseal PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/norriseal/pressure-safety-valve-catalog-89.html"] },
  { name: "Bermad PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/bermad/pressure-safety-valve-catalog-90.html"] },
  { name: "OCV PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/ocv/pressure-safety-valve-catalog-91.html"] },
  { name: "Singer Valve", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/singer-valve/pressure-safety-valve-catalog-92.html"] },
  { name: "Cla-Val PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/cla-val/pressure-safety-valve-catalog-93.html"] },
  { name: "Watts ACV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/watts-acv/pressure-safety-valve-catalog-94.html"] },
  { name: "Zurn PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/zurn/pressure-safety-valve-catalog-95.html"] },
  { name: "Apollo PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/apollo/pressure-safety-valve-catalog-96.html"] },
  { name: "Conbraco PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/conbraco/pressure-safety-valve-catalog-97.html"] },
  { name: "Flomatic PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/flomatic/pressure-safety-valve-catalog-98.html"] },
  { name: "Val-Matic PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/val-matic/pressure-safety-valve-catalog-99.html"] },
  { name: "APCO PSV", category: "PSV", catalogUrls: ["https://pdf.directindustry.com/pdf/apco/pressure-safety-valve-catalog-100.html"] },

  // ============ TRANSMITTERS (100 entries) ============
  { name: "Emerson Rosemount", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/emerson/transmitter-catalog-1.html"] },
  { name: "Rosemount", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/rosemount/transmitter-catalog-2.html"] },
  { name: "Yokogawa", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/yokogawa/transmitter-catalog-3.html"] },
  { name: "Endress+Hauser", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/endressplushauser/transmitter-catalog-4.html"] },
  { name: "ABB", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/abb/transmitter-catalog-5.html"] },
  { name: "Siemens", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/siemens/transmitter-catalog-6.html"] },
  { name: "Honeywell Transmitter", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/honeywell/transmitter-catalog-7.html"] },
  { name: "Schneider Electric Transmitter", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/schneider-electric/transmitter-catalog-8.html"] },
  { name: "WIKA", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/wika/transmitter-catalog-9.html"] },
  { name: "VEGA", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/vega/transmitter-catalog-10.html"] },
  { name: "KROHNE", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/krohne/transmitter-catalog-11.html"] },
  { name: "Azbil", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/azbil/transmitter-catalog-12.html"] },
  { name: "Foxboro", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/foxboro/transmitter-catalog-13.html"] },
  { name: "Badger Meter", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/badger-meter/transmitter-catalog-14.html"] },
  { name: "SMAR", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/smar/transmitter-catalog-15.html"] },
  { name: "Fuji Electric", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/fuji-electric/transmitter-catalog-16.html"] },
  { name: "Baumer", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/baumer/transmitter-catalog-17.html"] },
  { name: "ifm", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/ifm/transmitter-catalog-18.html"] },
  { name: "Balluff", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/balluff/transmitter-catalog-19.html"] },
  { name: "Pepperl+Fuchs", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/pepperlplusfuchs/transmitter-catalog-20.html"] },
  { name: "OMEGA", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/omega/transmitter-catalog-21.html"] },
  { name: "Danfoss Transmitter", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/danfoss/transmitter-catalog-22.html"] },
  { name: "Ashcroft", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/ashcroft/transmitter-catalog-23.html"] },
  { name: "Setra", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/setra/transmitter-catalog-24.html"] },
  { name: "GE Measurement", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/ge-measurement/transmitter-catalog-25.html"] },
  { name: "Keller", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/keller/transmitter-catalog-26.html"] },
  { name: "Aplisens", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/aplisens/transmitter-catalog-27.html"] },
  { name: "BD Sensors", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/bd-sensors/transmitter-catalog-28.html"] },
  { name: "Trafag", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/trafag/transmitter-catalog-29.html"] },
  { name: "Nivus", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/nivus/transmitter-catalog-30.html"] },
  { name: "Magnetrol", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/magnetrol/transmitter-catalog-31.html"] },
  { name: "SICK", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/sick/transmitter-catalog-32.html"] },
  { name: "Micro Motion", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/micro-motion/transmitter-catalog-33.html"] },
  { name: "Dwyer", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/dwyer/transmitter-catalog-34.html"] },
  { name: "Gems Sensors", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/gems-sensors/transmitter-catalog-35.html"] },
  { name: "TE Connectivity", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/te-connectivity/transmitter-catalog-36.html"] },
  { name: "Sensata", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/sensata/transmitter-catalog-37.html"] },
  { name: "Amphenol", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/amphenol/transmitter-catalog-38.html"] },
  { name: "Sensirion", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/sensirion/transmitter-catalog-39.html"] },
  { name: "Bosch Sensortec", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/bosch-sensortec/transmitter-catalog-40.html"] },
  { name: "TDK InvenSense", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/tdk-invensense/transmitter-catalog-41.html"] },
  { name: "STMicroelectronics", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/stmicroelectronics/transmitter-catalog-42.html"] },
  { name: "NXP", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/nxp/transmitter-catalog-43.html"] },
  { name: "Analog Devices", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/analog-devices/transmitter-catalog-44.html"] },
  { name: "Texas Instruments", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/texas-instruments/transmitter-catalog-45.html"] },
  { name: "Infineon", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/infineon/transmitter-catalog-46.html"] },
  { name: "Melexis", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/melexis/transmitter-catalog-47.html"] },
  { name: "Allegro", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/allegro/transmitter-catalog-48.html"] },
  { name: "AMS", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/ams/transmitter-catalog-49.html"] },
  { name: "Maxim Integrated", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/maxim-integrated/transmitter-catalog-50.html"] },
  { name: "ON Semiconductor", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/on-semiconductor/transmitter-catalog-51.html"] },
  { name: "Microchip", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/microchip/transmitter-catalog-52.html"] },
  { name: "Renesas", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/renesas/transmitter-catalog-53.html"] },
  { name: "ROHM", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/rohm/transmitter-catalog-54.html"] },
  { name: "Panasonic Sensors", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/panasonic-sensors/transmitter-catalog-55.html"] },
  { name: "Murata", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/murata/transmitter-catalog-56.html"] },
  { name: "TDK", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/tdk/transmitter-catalog-57.html"] },
  { name: "Alps Alpine", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/alps-alpine/transmitter-catalog-58.html"] },
  { name: "Vishay", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/vishay/transmitter-catalog-59.html"] },
  { name: "Keyence", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/keyence/transmitter-catalog-60.html"] },
  { name: "Banner Engineering", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/banner-engineering/transmitter-catalog-61.html"] },
  { name: "Turck", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/turck/transmitter-catalog-62.html"] },
  { name: "Wenglor", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/wenglor/transmitter-catalog-63.html"] },
  { name: "Leuze", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/leuze/transmitter-catalog-64.html"] },
  { name: "Di-soric", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/di-soric/transmitter-catalog-65.html"] },
  { name: "Contrinex", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/contrinex/transmitter-catalog-66.html"] },
  { name: "Sensopart", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/sensopart/transmitter-catalog-67.html"] },
  { name: "Datalogic", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/datalogic/transmitter-catalog-68.html"] },
  { name: "Optex FA", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/optex-fa/transmitter-catalog-69.html"] },
  { name: "Autonics", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/autonics/transmitter-catalog-70.html"] },
  { name: "Hanyoung Nux", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/hanyoung-nux/transmitter-catalog-71.html"] },
  { name: "Koyo", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/koyo/transmitter-catalog-72.html"] },
  { name: "Sunx", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/sunx/transmitter-catalog-73.html"] },
  { name: "Carlo Gavazzi", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/carlo-gavazzi/transmitter-catalog-74.html"] },
  { name: "Elobau", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/elobau/transmitter-catalog-75.html"] },
  { name: "EGE", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/ege/transmitter-catalog-76.html"] },
  { name: "Proxitron", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/proxitron/transmitter-catalog-77.html"] },
  { name: "Rechner", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/rechner/transmitter-catalog-78.html"] },
  { name: "Standex Meder", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/standex-meder/transmitter-catalog-79.html"] },
  { name: "Hamlin", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/hamlin/transmitter-catalog-80.html"] },
  { name: "HSI Sensing", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/hsi-sensing/transmitter-catalog-81.html"] },
  { name: "Coto", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/coto/transmitter-catalog-82.html"] },
  { name: "PIC", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/pic/transmitter-catalog-83.html"] },
  { name: "Littelfuse", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/littelfuse/transmitter-catalog-84.html"] },
  { name: "Telemecanique", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/telemecanique/transmitter-catalog-85.html"] },
  { name: "Bernstein", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/bernstein/transmitter-catalog-86.html"] },
  { name: "Schmersal", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/schmersal/transmitter-catalog-87.html"] },
  { name: "Pilz", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/pilz/transmitter-catalog-88.html"] },
  { name: "Euchner", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/euchner/transmitter-catalog-89.html"] },
  { name: "IDEM Safety", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/idem-safety/transmitter-catalog-90.html"] },
  { name: "Fortress", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/fortress/transmitter-catalog-91.html"] },
  { name: "Pizzato", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/pizzato/transmitter-catalog-92.html"] },
  { name: "Steute", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/steute/transmitter-catalog-93.html"] },
  { name: "K.A. Schmersal", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/ka-schmersal/transmitter-catalog-94.html"] },
  { name: "AZO Sensors", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/azo-sensors/transmitter-catalog-95.html"] },
  { name: "Dold", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/dold/transmitter-catalog-96.html"] },
  { name: "Wieland", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/wieland/transmitter-catalog-97.html"] },
  { name: "Leuze Safety", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/leuze-safety/transmitter-catalog-98.html"] },
  { name: "Omron Safety", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/omron-safety/transmitter-catalog-99.html"] },
  { name: "SICK Safety", category: "Transmitter", catalogUrls: ["https://pdf.directindustry.com/pdf/sick-safety/transmitter-catalog-100.html"] },

  // ============ ELECTRIC EQUIPMENT (100 entries) ============
  { name: "Siemens Electric", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/siemens/electric-equipment-catalog-1.html"] },
  { name: "ABB Electric", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/abb/electric-equipment-catalog-2.html"] },
  { name: "Schneider Electric Motor", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/schneider-electric/electric-equipment-catalog-3.html"] },
  { name: "GE", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/ge/electric-equipment-catalog-4.html"] },
  { name: "Mitsubishi Electric", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/mitsubishi-electric/electric-equipment-catalog-5.html"] },
  { name: "Rockwell Automation", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/rockwell-automation/electric-equipment-catalog-6.html"] },
  { name: "Eaton", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/eaton/electric-equipment-catalog-7.html"] },
  { name: "Bosch Rexroth", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/bosch-rexroth/electric-equipment-catalog-8.html"] },
  { name: "WEG", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/weg/electric-equipment-catalog-9.html"] },
  { name: "Danfoss Drives", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/danfoss/electric-equipment-catalog-10.html"] },
  { name: "Emerson Electric", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/emerson/electric-equipment-catalog-11.html"] },
  { name: "Yaskawa", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/yaskawa/electric-equipment-catalog-12.html"] },
  { name: "Omron", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/omron/electric-equipment-catalog-13.html"] },
  { name: "Hitachi", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/hitachi/electric-equipment-catalog-14.html"] },
  { name: "Toshiba", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/toshiba/electric-equipment-catalog-15.html"] },
  { name: "Fuji Electric Motors", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/fuji-electric/electric-equipment-catalog-16.html"] },
  { name: "LS Electric", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/ls-electric/electric-equipment-catalog-17.html"] },
  { name: "Hyundai Electric", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/hyundai-electric/electric-equipment-catalog-18.html"] },
  { name: "Nidec", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/nidec/electric-equipment-catalog-19.html"] },
  { name: "Baldor", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/baldor/electric-equipment-catalog-20.html"] },
  { name: "TECO-Westinghouse", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/teco-westinghouse/electric-equipment-catalog-21.html"] },
  { name: "Brook Crompton", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/brook-crompton/electric-equipment-catalog-22.html"] },
  { name: "Regal Rexnord", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/regal-rexnord/electric-equipment-catalog-23.html"] },
  { name: "Leeson", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/leeson/electric-equipment-catalog-24.html"] },
  { name: "Kollmorgen", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/kollmorgen/electric-equipment-catalog-25.html"] },
  { name: "SEW-Eurodrive", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/sew-eurodrive/electric-equipment-catalog-26.html"] },
  { name: "Lenze", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/lenze/electric-equipment-catalog-27.html"] },
  { name: "Bonfiglioli", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/bonfiglioli/electric-equipment-catalog-28.html"] },
  { name: "Nord Drivesystems", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/nord-drivesystems/electric-equipment-catalog-29.html"] },
  { name: "Vacon", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/vacon/electric-equipment-catalog-30.html"] },
  { name: "Delta Electronics", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/delta-electronics/electric-equipment-catalog-31.html"] },
  { name: "Allen-Bradley", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/allen-bradley/electric-equipment-catalog-32.html"] },
  { name: "Control Techniques", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/control-techniques/electric-equipment-catalog-33.html"] },
  { name: "Parker Hannifin", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/parker-hannifin/electric-equipment-catalog-34.html"] },
  { name: "Festo", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/festo/electric-equipment-catalog-35.html"] },
  { name: "SMC", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/smc/electric-equipment-catalog-36.html"] },
  { name: "Oriental Motor", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/oriental-motor/electric-equipment-catalog-37.html"] },
  { name: "Lin Engineering", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/lin-engineering/electric-equipment-catalog-38.html"] },
  { name: "Applied Motion", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/applied-motion/electric-equipment-catalog-39.html"] },
  { name: "Moons Industries", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/moons-industries/electric-equipment-catalog-40.html"] },
  { name: "Nanotec", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/nanotec/electric-equipment-catalog-41.html"] },
  { name: "Portescap", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/portescap/electric-equipment-catalog-42.html"] },
  { name: "Faulhaber", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/faulhaber/electric-equipment-catalog-43.html"] },
  { name: "Maxon Motor", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/maxon-motor/electric-equipment-catalog-44.html"] },
  { name: "MinebeaMitsumi", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/minebeamitsumi/electric-equipment-catalog-45.html"] },
  { name: "Johnson Electric", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/johnson-electric/electric-equipment-catalog-46.html"] },
  { name: "Mabuchi", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/mabuchi/electric-equipment-catalog-47.html"] },
  { name: "Buhler Motor", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/buhler-motor/electric-equipment-catalog-48.html"] },
  { name: "Dunkermotoren", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/dunkermotoren/electric-equipment-catalog-49.html"] },
  { name: "Pittman", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/pittman/electric-equipment-catalog-50.html"] },
  { name: "Ametek", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/ametek/electric-equipment-catalog-51.html"] },
  { name: "Allied Motion", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/allied-motion/electric-equipment-catalog-52.html"] },
  { name: "Anaheim Automation", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/anaheim-automation/electric-equipment-catalog-53.html"] },
  { name: "Haydon Kerk", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/haydon-kerk/electric-equipment-catalog-54.html"] },
  { name: "Nippon Pulse", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/nippon-pulse/electric-equipment-catalog-55.html"] },
  { name: "Sanyo Denki", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/sanyo-denki/electric-equipment-catalog-56.html"] },
  { name: "Tamagawa Seiki", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/tamagawa-seiki/electric-equipment-catalog-57.html"] },
  { name: "THK", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/thk/electric-equipment-catalog-58.html"] },
  { name: "NSK", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/nsk/electric-equipment-catalog-59.html"] },
  { name: "IKO", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/iko/electric-equipment-catalog-60.html"] },
  { name: "Hiwin", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/hiwin/electric-equipment-catalog-61.html"] },
  { name: "PMI", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/pmi/electric-equipment-catalog-62.html"] },
  { name: "Schneeberger", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/schneeberger/electric-equipment-catalog-63.html"] },
  { name: "Igus", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/igus/electric-equipment-catalog-64.html"] },
  { name: "Schaeffler", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/schaeffler/electric-equipment-catalog-65.html"] },
  { name: "SKF", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/skf/electric-equipment-catalog-66.html"] },
  { name: "Timken", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/timken/electric-equipment-catalog-67.html"] },
  { name: "NTN", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/ntn/electric-equipment-catalog-68.html"] },
  { name: "Koyo Bearings", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/koyo-bearings/electric-equipment-catalog-69.html"] },
  { name: "JTEKT", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/jtekt/electric-equipment-catalog-70.html"] },
  { name: "Dodge", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/dodge/electric-equipment-catalog-71.html"] },
  { name: "Rexnord", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/rexnord/electric-equipment-catalog-72.html"] },
  { name: "Martin Sprocket", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/martin-sprocket/electric-equipment-catalog-73.html"] },
  { name: "Tsubaki", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/tsubaki/electric-equipment-catalog-74.html"] },
  { name: "Renold", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/renold/electric-equipment-catalog-75.html"] },
  { name: "Iwis", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/iwis/electric-equipment-catalog-76.html"] },
  { name: "Diamond Chain", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/diamond-chain/electric-equipment-catalog-77.html"] },
  { name: "Senqcia", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/senqcia/electric-equipment-catalog-78.html"] },
  { name: "Regina Chain", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/regina-chain/electric-equipment-catalog-79.html"] },
  { name: "US Tsubaki", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/us-tsubaki/electric-equipment-catalog-80.html"] },
  { name: "Peer Bearing", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/peer-bearing/electric-equipment-catalog-81.html"] },
  { name: "RBC Bearings", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/rbc-bearings/electric-equipment-catalog-82.html"] },
  { name: "Kaydon", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/kaydon/electric-equipment-catalog-83.html"] },
  { name: "Rotek", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/rotek/electric-equipment-catalog-84.html"] },
  { name: "PSL", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/psl/electric-equipment-catalog-85.html"] },
  { name: "IMO", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/imo/electric-equipment-catalog-86.html"] },
  { name: "Liebherr Bearing", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/liebherr-bearing/electric-equipment-catalog-87.html"] },
  { name: "Antrieb", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/antrieb/electric-equipment-catalog-88.html"] },
  { name: "Rollix", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/rollix/electric-equipment-catalog-89.html"] },
  { name: "Franke", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/franke/electric-equipment-catalog-90.html"] },
  { name: "Rodriguez", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/rodriguez/electric-equipment-catalog-91.html"] },
  { name: "Silverthin", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/silverthin/electric-equipment-catalog-92.html"] },
  { name: "Harmonic Drive", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/harmonic-drive/electric-equipment-catalog-93.html"] },
  { name: "Sumitomo", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/sumitomo/electric-equipment-catalog-94.html"] },
  { name: "Nabtesco", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/nabtesco/electric-equipment-catalog-95.html"] },
  { name: "Spinea", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/spinea/electric-equipment-catalog-96.html"] },
  { name: "Nidec-Shimpo", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/nidec-shimpo/electric-equipment-catalog-97.html"] },
  { name: "Cone Drive", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/cone-drive/electric-equipment-catalog-98.html"] },
  { name: "Stober", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/stober/electric-equipment-catalog-99.html"] },
  { name: "Wittenstein", category: "Electric", catalogUrls: ["https://pdf.directindustry.com/pdf/wittenstein/electric-equipment-catalog-100.html"] },
];

// Map spreadsheet categories to database categories
const categoryMap: Record<string, string> = {
  'Valve': 'Valves',
  'Pump': 'Pumps',
  'Tank': 'Tanks',
  'PSV': 'Valves',  // PSVs are specialized valves
  'Transmitter': 'Instrumentation',
  'Electric': 'Electrical',
};

interface ProductInfo {
  name: string;
  description: string;
  image: string;
  modelNumber?: string;
}

// Search for products using Firecrawl
async function searchForProducts(
  manufacturerName: string,
  category: string,
  apiKey: string
): Promise<ProductInfo[]> {
  const products: ProductInfo[] = [];
  
  try {
    // Search DirectIndustry first for better product data
    let searchQuery = `site:directindustry.com "${manufacturerName}" ${category}`;
    console.log(`Searching: ${searchQuery}`);
    
    let searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 8,
        scrapeOptions: {
          formats: ['markdown']
        }
      }),
    });

    let searchData: any = { data: [] };
    
    if (searchResponse.ok) {
      searchData = await searchResponse.json();
      console.log(`DirectIndustry returned ${searchData.data?.length || 0} results`);
    }
    
    // If no DirectIndustry results, search the web
    if (!searchData.data || searchData.data.length === 0) {
      searchQuery = `"${manufacturerName}" ${category} products specifications`;
      console.log(`Fallback search: ${searchQuery}`);
      
      searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 10,
          scrapeOptions: {
            formats: ['markdown']
          }
        }),
      });
      
      if (searchResponse.ok) {
        searchData = await searchResponse.json();
        console.log(`Web search returned ${searchData.data?.length || 0} results`);
      }
    }

    if (searchData.data && Array.isArray(searchData.data)) {
      for (const result of searchData.data.slice(0, 10)) {
        // Extract product name from title
        let productName = result.title?.replace(/\s*-\s*DirectIndustry.*$/i, '').trim() || '';
        productName = productName.replace(/\s*\|.*$/, '').trim();
        productName = productName.replace(new RegExp(`^${manufacturerName}\\s*[-|:]?\\s*`, 'i'), '').trim();
        
        if (!productName || productName.length < 3 || productName.length > 120) continue;
        // Skip navigation/generic pages
        if (/^(home|about|contact|products?|catalog|download|careers|news|blog)/i.test(productName)) continue;
        
        // Extract description from markdown or snippet
        const markdown = result.markdown || '';
        let description = result.snippet || '';
        
        if (!description) {
          const descPatterns = [
            /(?:description|overview|features|specifications)[:\s]*([^\n]+(?:\n[^\n#]+)*)/i,
            /^([A-Z][^.!?]+[.!?])/m,
          ];
          
          for (const pattern of descPatterns) {
            const descMatch = markdown.match(pattern);
            if (descMatch) {
              description = descMatch[1].trim().slice(0, 400);
              break;
            }
          }
        }
        
        // Extract model number if present
        const modelMatch = productName.match(/\b([A-Z]{1,4}[-\s]?\d{2,6}[A-Z]?)\b/);
        const modelNumber = modelMatch ? modelMatch[1] : undefined;
        
        // Extract images from markdown
        const imageRegex = /https?:\/\/[^\s"'<>)]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>)]*)?/gi;
        const images = markdown.match(imageRegex) || [];
        
        // Filter for product images
        const productImages = images.filter((img: string) => 
          !img.includes('logo') && 
          !img.includes('icon') && 
          !img.includes('favicon') &&
          !img.includes('banner') &&
          !img.includes('avatar') &&
          !img.includes('placeholder') &&
          img.length < 500
        );
        
        if (productName) {
          products.push({
            name: productName,
            description: description || `${category} product from ${manufacturerName}`,
            image: productImages[0] || '',
            modelNumber
          });
        }
      }
    }
    
    return products;
  } catch (error) {
    console.error(`Error searching for ${manufacturerName}:`, error);
    return products;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { startIndex = 0, batchSize = 3, category } = await req.json();
    
    // Filter brands by category if specified
    let brandsToProcess = spreadsheetBrands;
    if (category) {
      brandsToProcess = spreadsheetBrands.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }
    
    // Get the batch to process
    const batch = brandsToProcess.slice(startIndex, startIndex + batchSize);
    
    console.log(`Processing batch of ${batch.length} brands starting at index ${startIndex}`);
    console.log(`Total brands in category: ${brandsToProcess.length}`);
    
    const results: any[] = [];
    let totalMaterialsCreated = 0;
    
    for (const brand of batch) {
      console.log(`\n=== Processing: ${brand.name} (${brand.category}) ===`);
      
      // Ensure manufacturer exists
      let { data: manufacturer } = await supabase
        .from('manufacturers')
        .select('id')
        .eq('name', brand.name)
        .maybeSingle();
      
      if (!manufacturer) {
        const { data: newManufacturer, error: createError } = await supabase
          .from('manufacturers')
          .insert({
            name: brand.name,
            website: brand.catalogUrls[0],
          })
          .select('id')
          .single();
        
        if (createError) {
          console.error(`Failed to create manufacturer ${brand.name}:`, createError);
          results.push({
            brand: brand.name,
            category: brand.category,
            error: 'Failed to create manufacturer',
          });
          continue;
        }
        manufacturer = newManufacturer;
      }
      
      // Search for products
      const products = await searchForProducts(
        brand.name,
        brand.category,
        firecrawlApiKey
      );
      
      console.log(`Found ${products.length} products for ${brand.name}`);
      
      // Insert materials
      let materialsCreated = 0;
      for (const product of products) {
        // Check if material already exists
        const { data: existing } = await supabase
          .from('materials')
          .select('id')
          .eq('manufacturer_id', manufacturer.id)
          .eq('product_name', product.name)
          .maybeSingle();
        
        if (!existing) {
          // Map the category to the valid database category
          const dbCategory = categoryMap[brand.category] || brand.category;
          
          const { error: insertError } = await supabase
            .from('materials')
            .insert({
              manufacturer_id: manufacturer.id,
              product_name: product.name,
              title: `${brand.name} ${product.name}`,
              image_url: product.image || null,
              model_number: product.modelNumber || null,
              category: dbCategory,
            });
          
          if (!insertError) {
            materialsCreated++;
            totalMaterialsCreated++;
          } else {
            console.error(`Failed to insert material ${product.name}:`, insertError);
          }
        }
      }
      
      results.push({
        brand: brand.name,
        category: brand.category,
        productsFound: products.length,
        materialsCreated,
      });
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Get total count
    const { count: totalMaterials } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });
    
    // Get counts by category
    const { data: categoryCounts } = await supabase
      .from('materials')
      .select('category');
    
    const categoryBreakdown: Record<string, number> = {};
    if (categoryCounts) {
      for (const item of categoryCounts) {
        categoryBreakdown[item.category || 'Unknown'] = (categoryBreakdown[item.category || 'Unknown'] || 0) + 1;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: batch.length,
        nextIndex: startIndex + batch.length,
        totalBrands: brandsToProcess.length,
        remainingBrands: brandsToProcess.length - (startIndex + batch.length),
        materialsCreatedThisBatch: totalMaterialsCreated,
        totalMaterialsInDatabase: totalMaterials,
        categoryBreakdown,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in import-spreadsheet-materials:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
