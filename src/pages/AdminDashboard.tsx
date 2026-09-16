import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, uploadFile } from '../lib/supabase';
import { Ouvrage, Collection, ParametresSite, Matiere, Partenaire, Ressource } from '../types';
import { BookOpen, LogOut, Settings, ListPlus, Edit3, Trash2, Save, X, Plus, ImageIcon, BookText, Building2, FileText, ExternalLink, Download } from 'lucide-react';
import { Logo } from '../components/Logo';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'collections' | 'ouvrages' | 'matieres' | 'ressources' | 'partenaires' | 'parametres'>('collections');
  
  const [ouvrages, setOuvrages] = useState<Ouvrage[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [parametres, setParametres] = useState<ParametresSite | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modals state
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Partial<Collection> | null>(null);

  const [isOuvrageModalOpen, setIsOuvrageModalOpen] = useState(false);
  const [editingOuvrage, setEditingOuvrage] = useState<Partial<Ouvrage> | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [extractFile, setExtractFile] = useState<File | null>(null);

  const [isMatiereModalOpen, setIsMatiereModalOpen] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<Partial<Matiere> | null>(null);

  const [isPartenaireModalOpen, setIsPartenaireModalOpen] = useState(false);
  const [editingPartenaire, setEditingPartenaire] = useState<Partial<Partenaire> | null>(null);

  const [isRessourceModalOpen, setIsRessourceModalOpen] = useState(false);
  const [editingRessource, setEditingRessource] = useState<Partial<Ressource> | null>(null);
  const [ressourceFile, setRessourceFile] = useState<File | null>(null);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const fetchData = async () => {
    try {
      const [colRes, ouvRes, paramRes, matRes, partRes, resRes] = await Promise.all([
        supabase.from('collections').select('*').order('ordre'),
        supabase.from('ouvrages').select('*, collections(*)').order('created_at', { ascending: false }),
        supabase.from('parametres_site').select('*').limit(1),
        supabase.from('matieres').select('*').order('nom'),
        supabase.from('partenaires').select('*').order('nom'),
        supabase.from('ressources').select('*, ouvrages(titre), collections(nom)').order('created_at', { ascending: false })
      ]);

      if (colRes.data) setCollections(colRes.data);
      if (ouvRes.data) setOuvrages(ouvRes.data);
      if (paramRes.data && paramRes.data[0]) setParametres(paramRes.data[0]);
      if (matRes.data) setMatieres(matRes.data);
      if (partRes.data) setPartenaires(partRes.data);
      if (resRes.data) setRessources(resRes.data as any);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // --- COLLECTIONS ---
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCollection?.id) {
        const { error } = await supabase.from('collections').update(editingCollection).eq('id', editingCollection.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('collections').insert([editingCollection]);
        if (error) throw error;
      }
      await fetchData();
      setIsCollectionModalOpen(false);
      showMessage('Collection enregistrée avec succès', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette collection ?')) return;
    try {
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      showMessage('Collection supprimée', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    }
  };

  const handleUploadCollectionImage = async (collection: Collection, file: File) => {
    try {
      setSaving(true);
      const url = await uploadFile(file, 'medias', 'collections');
      const { error } = await supabase.from('collections').update({ image_url: url }).eq('id', collection.id);
      if (error) throw error;
      
      setCollections(collections.map(c => c.id === collection.id ? { ...c, image_url: url } : c));
      showMessage("Image mise à jour avec succès", "success");
    } catch (err) {
      showMessage("Erreur lors de l'envoi de l'image", "error");
    } finally {
      setSaving(false);
    }
  };

  // --- OUVRAGES ---
  const handleSaveOuvrage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let coverUrl = editingOuvrage?.couverture_url;
      let extractUrl = editingOuvrage?.extrait_url;

      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'medias', 'couvertures');
      }
      if (extractFile) {
        extractUrl = await uploadFile(extractFile, 'medias', 'extraits');
      }

      const ouvrageData = {
        ...editingOuvrage,
        couverture_url: coverUrl,
        extrait_url: extractUrl,
        collection_id: editingOuvrage?.collection_id || null,
        matiere: editingOuvrage?.matiere || null
      };

      // Remove joined relation objects to prevent Supabase errors
      delete ouvrageData.collections;

      if (ouvrageData.id) {
        const { error } = await supabase.from('ouvrages').update(ouvrageData).eq('id', ouvrageData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ouvrages').insert([ouvrageData]);
        if (error) throw error;
      }
      
      await fetchData();
      setIsOuvrageModalOpen(false);
      setCoverFile(null);
      setExtractFile(null);
      showMessage('Ouvrage enregistré avec succès', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOuvrage = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet ouvrage ?')) return;
    try {
      const { error } = await supabase.from('ouvrages').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      showMessage('Ouvrage supprimé', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    }
  };

  // --- MATIERES ---
  const handleSaveMatiere = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMatiere?.id) {
        const { error } = await supabase.from('matieres').update(editingMatiere).eq('id', editingMatiere.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('matieres').insert([editingMatiere]);
        if (error) throw error;
      }
      await fetchData();
      setIsMatiereModalOpen(false);
      showMessage('Matière enregistrée avec succès', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMatiere = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette matière ?')) return;
    try {
      const { error } = await supabase.from('matieres').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      showMessage('Matière supprimée', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    }
  };

  // --- PARTENAIRES ---
  const handleSavePartenaire = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPartenaire?.id) {
        const { error } = await supabase.from('partenaires').update(editingPartenaire).eq('id', editingPartenaire.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('partenaires').insert([editingPartenaire]);
        if (error) throw error;
      }
      await fetchData();
      setIsPartenaireModalOpen(false);
      showMessage('Partenaire enregistré avec succès', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePartenaire = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce partenaire ?')) return;
    try {
      const { error } = await supabase.from('partenaires').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      showMessage('Partenaire supprimé', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    }
  };

  // --- RESSOURCES ---
  const handleSaveRessource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let fileUrl = editingRessource?.google_drive_url || '';

      if (ressourceFile) {
        fileUrl = await uploadFile(ressourceFile, 'medias', 'ressources');
      }

      if (!fileUrl) {
        throw new Error("Veuillez fournir un lien (URL / Google Drive) ou téléverser un fichier.");
      }

      let detectedFormat = editingRessource?.format;
      if (!detectedFormat && ressourceFile) {
        detectedFormat = ressourceFile.name.split('.').pop()?.toUpperCase() || 'DOCUMENT';
      }

      const ressourceData: any = {
        ...editingRessource,
        google_drive_url: fileUrl,
        format: detectedFormat || 'PDF',
        matiere: editingRessource?.matiere || null,
        niveau: editingRessource?.niveau || null,
        ouvrage_id: editingRessource?.ouvrage_id || null,
        collection_id: editingRessource?.collection_id || null,
        publie: editingRessource?.publie !== undefined ? editingRessource.publie : true,
      };

      delete ressourceData.ouvrages;
      delete ressourceData.collections;

      if (ressourceData.id) {
        const { error } = await supabase.from('ressources').update(ressourceData).eq('id', ressourceData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ressources').insert([ressourceData]);
        if (error) throw error;
      }

      await fetchData();
      setIsRessourceModalOpen(false);
      setRessourceFile(null);
      showMessage('Ressource enregistrée avec succès', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRessource = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette ressource ?')) return;
    try {
      const { error } = await supabase.from('ressources').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      showMessage('Ressource supprimée avec succès', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    }
  };

  // --- PARAMETRES ---
  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parametres) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('parametres_site').update(parametres).eq('id', parametres.id);
      if (error) throw error;
      showMessage('Paramètres sauvegardés avec succès', 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (file: File) => {
    if (!parametres) return;
    try {
      setSaving(true);
      const url = await uploadFile(file, 'medias', 'logos');
      const { error } = await supabase.from('parametres_site').update({ logo_url: url }).eq('id', parametres.id);
      if (error) throw error;
      
      setParametres({ ...parametres, logo_url: url });
      showMessage("Logo mis à jour avec succès", "success");
    } catch (err) {
      showMessage("Erreur lors de l'envoi du logo", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!parametres || !window.confirm('Voulez-vous vraiment supprimer le logo ?')) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('parametres_site').update({ logo_url: null }).eq('id', parametres.id);
      if (error) throw error;
      
      setParametres({ ...parametres, logo_url: null });
      showMessage("Logo supprimé avec succès", "success");
    } catch (err) {
      showMessage("Erreur lors de la suppression du logo", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-bordeaux border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-anthracite">Administration</h1>
            <p className="text-gray-500 mt-1">Gérez le contenu de votre site</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="/editions-phenix-source.zip"
              download="editions-phenix-source.zip"
              className="inline-flex items-center gap-2 px-4 py-2 bg-bleu hover:bg-bleu-royal text-white font-semibold rounded-lg shadow-sm transition-all"
              title="Télécharger l'archive ZIP du code source"
            >
              <Download size={18} className="text-jaune-vif" />
              <span>Télécharger le ZIP du projet</span>
            </a>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut size={18} /> Déconnexion
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Menu */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <button 
                onClick={() => setActiveTab('collections')}
                className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'collections' ? 'bg-bordeaux text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Collections
              </button>
              <button 
                onClick={() => setActiveTab('ouvrages')}
                className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'ouvrages' ? 'bg-bordeaux text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Ouvrages
              </button>
              <button 
                onClick={() => setActiveTab('matieres')}
                className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'matieres' ? 'bg-bordeaux text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Matières
              </button>
              <button 
                onClick={() => setActiveTab('ressources')}
                className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'ressources' ? 'bg-bordeaux text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Ressources
              </button>
              <button 
                onClick={() => setActiveTab('partenaires')}
                className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'partenaires' ? 'bg-bordeaux text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Partenaires
              </button>
              <button 
                onClick={() => setActiveTab('parametres')}
                className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'parametres' ? 'bg-bordeaux text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Paramètres
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
            
            {/* COLLECTIONS TAB */}
            {activeTab === 'collections' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-anthracite">Collections</h2>
                  <button 
                    onClick={() => { setEditingCollection({ publie: true }); setIsCollectionModalOpen(true); }}
                    className="flex items-center gap-2 bg-bordeaux text-white px-4 py-2 rounded-md hover:bg-bordeaux-light transition-colors"
                  >
                    <Plus size={18} /> Ajouter
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.map(col => (
                    <div key={col.id} className="border border-gray-200 rounded-xl p-4 flex flex-col bg-white shadow-sm relative group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                        <button onClick={() => { setEditingCollection(col); setIsCollectionModalOpen(true); }} className="p-1.5 bg-white text-gray-700 rounded shadow-sm hover:text-bordeaux">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteCollection(col.id)} className="p-1.5 bg-white text-red-600 rounded shadow-sm hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                        {col.image_url ? (
                          <img src={col.image_url} alt={col.nom} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
                            <ImageIcon size={16} /> {col.image_url ? 'Changer l\'image' : 'Ajouter une image'}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) handleUploadCollectionImage(col, e.target.files[0]);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{col.nom}</h3>
                      <p className="text-sm text-gray-600 mb-4 flex-grow">{col.description}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <span className={`text-xs px-2 py-1 rounded-full ${col.publie ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {col.publie ? 'Publiée' : 'Masquée'}
                        </span>
                        <span className="text-xs text-gray-400">Ordre: {col.ordre}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OUVRAGES TAB */}
            {activeTab === 'ouvrages' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-anthracite">Ouvrages</h2>
                  <button 
                    onClick={() => { setEditingOuvrage({ disponibilite: true, afficher_prix: true, prix: 0 }); setIsOuvrageModalOpen(true); }}
                    className="flex items-center gap-2 bg-bordeaux text-white px-4 py-2 rounded-md hover:bg-bordeaux-light transition-colors"
                  >
                    <Plus size={18} /> Ajouter
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 font-bold text-gray-700">Titre</th>
                        <th className="py-3 px-4 font-bold text-gray-700 hidden md:table-cell">Auteur</th>
                        <th className="py-3 px-4 font-bold text-gray-700">Collection</th>
                        <th className="py-3 px-4 font-bold text-gray-700 hidden sm:table-cell">Prix</th>
                        <th className="py-3 px-4 font-bold text-gray-700 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ouvrages.map(ouv => (
                        <tr key={ouv.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{ouv.titre}</div>
                            <div className="text-xs text-gray-500 sm:hidden">{ouv.prix.toFixed(2)} FCFA</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{ouv.auteur}</td>
                          <td className="py-3 px-4">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              {ouv.collections?.nom || 'Aucune'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900 hidden sm:table-cell">{ouv.prix.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setEditingOuvrage(ouv); setIsOuvrageModalOpen(true); }} className="p-2 text-gray-500 hover:text-bordeaux hover:bg-bordeaux/5 rounded-full transition-colors">
                                <Edit3 size={18} />
                              </button>
                              <button onClick={() => handleDeleteOuvrage(ouv.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MATIERES TAB */}
            {activeTab === 'matieres' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-anthracite">Matières / Disciplines</h2>
                  <button 
                    onClick={() => { setEditingMatiere({}); setIsMatiereModalOpen(true); }}
                    className="flex items-center gap-2 bg-bordeaux text-white px-4 py-2 rounded-md hover:bg-bordeaux-light transition-colors"
                  >
                    <Plus size={18} /> Ajouter
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {matieres.map(mat => (
                    <div key={mat.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg">
                      <span className="font-medium text-gray-800">{mat.nom}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingMatiere(mat); setIsMatiereModalOpen(true); }} className="text-gray-400 hover:text-bordeaux">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteMatiere(mat.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {matieres.length === 0 && (
                    <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
                      Aucune matière configurée. (Assurez-vous d'avoir exécuté le script SQL fourni !)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RESSOURCES TAB */}
            {activeTab === 'ressources' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-anthracite">Ressources Pédagogiques</h2>
                    <p className="text-sm text-gray-500">Gérez les fiches de cours, corrigés, exercices et documents téléchargeables.</p>
                  </div>
                  <button 
                    onClick={() => { setEditingRessource({ publie: true, type: 'Fiche de cours', format: 'PDF' }); setRessourceFile(null); setIsRessourceModalOpen(true); }}
                    className="flex items-center gap-2 bg-bordeaux text-white px-4 py-2 rounded-md hover:bg-bordeaux-light transition-colors"
                  >
                    <Plus size={18} /> Ajouter
                  </button>
                </div>
                
                <div className="space-y-4">
                  {ressources.map(res => (
                    <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl gap-4 hover:bg-gray-50/80 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-white border border-gray-200 rounded-lg text-bordeaux shrink-0">
                          <FileText size={22} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-bordeaux/10 text-bordeaux text-xs font-bold rounded uppercase">
                              {res.type}
                            </span>
                            {res.format && (
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded">
                                {res.format}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${res.publie ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                              {res.publie ? 'Publié' : 'Masqué'}
                            </span>
                          </div>
                          <h4 className="font-bold text-anthracite text-base">{res.titre}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                            {res.niveau && <span><strong>Niveau :</strong> {res.niveau}</span>}
                            {res.matiere && <span><strong>Matière :</strong> {res.matiere}</span>}
                            {res.ouvrages?.titre && <span><strong>Ouvrage lié :</strong> {res.ouvrages.titre}</span>}
                            {res.collections?.nom && <span><strong>Collection :</strong> {res.collections.nom}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        {res.google_drive_url && (
                          <a 
                            href={res.google_drive_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-100 flex items-center gap-1.5"
                          >
                            <ExternalLink size={14} /> Voir
                          </a>
                        )}
                        <button 
                          onClick={() => { setEditingRessource(res); setRessourceFile(null); setIsRessourceModalOpen(true); }} 
                          className="p-1.5 text-gray-500 hover:text-bordeaux rounded hover:bg-white transition-colors"
                          title="Modifier"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRessource(res.id)} 
                          className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-white transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {ressources.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <FileText size={40} className="mx-auto text-gray-400 mb-3" />
                      <p className="font-medium text-gray-700 mb-1">Aucune ressource pédagogique pour le moment</p>
                      <p className="text-sm text-gray-500">Cliquez sur « Ajouter » pour publier une fiche de cours, un corrigé ou un document.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PARTENAIRES TAB */}
            {activeTab === 'partenaires' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-anthracite">Partenaires</h2>
                  <button 
                    onClick={() => { setEditingPartenaire({}); setIsPartenaireModalOpen(true); }}
                    className="flex items-center gap-2 bg-bordeaux text-white px-4 py-2 rounded-md hover:bg-bordeaux-light transition-colors"
                  >
                    <Plus size={18} /> Ajouter
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partenaires.map(part => (
                    <div key={part.id} className="flex flex-col p-4 bg-gray-50 border border-gray-100 rounded-lg relative group">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => { setEditingPartenaire(part); setIsPartenaireModalOpen(true); }} className="text-gray-400 hover:text-bordeaux">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeletePartenaire(part.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white p-2 rounded shadow-sm text-dore"><Building2 size={20} /></div>
                        <span className="font-bold text-gray-800 pr-16">{part.nom}</span>
                      </div>
                      {part.adresse && <div className="text-sm text-gray-600 mt-2"><strong>Adresse :</strong> {part.adresse}</div>}
                      {part.contact && <div className="text-sm text-gray-600 mt-1"><strong>Contact :</strong> {part.contact}</div>}
                    </div>
                  ))}
                  {partenaires.length === 0 && (
                     <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
                       Aucun partenaire configuré.
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* PARAMETRES TAB */}
            {activeTab === 'parametres' && parametres && (
              <div>
                <h2 className="text-2xl font-bold text-anthracite mb-6">Paramètres Généraux</h2>
                
                {/* Section Logo */}
                <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl max-w-2xl">
                  <h3 className="text-lg font-bold text-anthracite mb-4">Logo du site</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      {parametres.logo_url ? (
                        <img src={parametres.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon className="text-gray-400" size={32} />
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-gray-500">
                        Téléchargez le logo de votre maison d'édition. Ce logo sera affiché dans l'en-tête de toutes les pages.
                        Privilégiez un format PNG avec fond transparent.
                      </p>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 flex items-center gap-2">
                          <ImageIcon size={16} /> Changer le logo
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) handleUploadLogo(e.target.files[0]);
                            }}
                          />
                        </label>
                        {parametres.logo_url && (
                          <button 
                            type="button" 
                            onClick={handleDeleteLogo}
                            className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-md font-medium text-sm border border-transparent transition-colors"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveParams} className="space-y-6 max-w-2xl bg-white p-6 border border-gray-200 rounded-xl">
                  <h3 className="text-lg font-bold text-anthracite mb-4">Informations & Textes</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numéro WhatsApp (Commandes)</label>
                    <input 
                      type="text" 
                      value={parametres.telephone_whatsapp}
                      onChange={(e) => setParametres({...parametres, telephone_whatsapp: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-bordeaux focus:border-bordeaux"
                      placeholder="+22501020304"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Inclure l'indicatif du pays (ex: +225 pour la Côte d'Ivoire)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coordonnées / Adresse</label>
                    <textarea 
                      value={parametres.coordonnees || ''}
                      onChange={(e) => setParametres({...parametres, coordonnees: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-bordeaux focus:border-bordeaux"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texte - Accueil</label>
                    <textarea 
                      value={parametres.texte_accueil || ''}
                      onChange={(e) => setParametres({...parametres, texte_accueil: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-bordeaux focus:border-bordeaux"
                      rows={3}
                      placeholder="Texte de présentation sur la page d'accueil..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texte - À Propos (Notre Histoire)</label>
                    <textarea 
                      value={parametres.texte_apropos || ''}
                      onChange={(e) => setParametres({...parametres, texte_apropos: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-bordeaux focus:border-bordeaux"
                      rows={5}
                      placeholder="Texte de la section 'Notre Histoire & Valeurs'..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texte - Ressources Pédagogiques</label>
                    <textarea 
                      value={parametres.texte_ressources || ''}
                      onChange={(e) => setParametres({...parametres, texte_ressources: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-bordeaux focus:border-bordeaux"
                      rows={3}
                      placeholder="Texte d'introduction sur la page Ressources..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Informations générales (Pied de page)</label>
                    <textarea 
                      value={parametres.infos_generales || ''}
                      onChange={(e) => setParametres({...parametres, infos_generales: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-bordeaux focus:border-bordeaux"
                      rows={3}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center gap-2 bg-bordeaux text-white px-6 py-2 rounded-md hover:bg-bordeaux-light transition-colors disabled:opacity-50"
                  >
                    <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Collection Modal */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingCollection?.id ? 'Modifier la Collection' : 'Nouvelle Collection'}</h3>
              <button onClick={() => setIsCollectionModalOpen(false)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveCollection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input required type="text" value={editingCollection?.nom || ''} onChange={e => setEditingCollection({...editingCollection, nom: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={editingCollection?.description || ''} onChange={e => setEditingCollection({...editingCollection, description: e.target.value})} className="w-full p-2 border rounded" rows={3} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Ordre d'affichage</label>
                  <input type="number" value={editingCollection?.ordre || 0} onChange={e => setEditingCollection({...editingCollection, ordre: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
                </div>
                <div className="flex-1 flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingCollection?.publie ?? true} onChange={e => setEditingCollection({...editingCollection, publie: e.target.checked})} className="rounded text-bordeaux focus:ring-bordeaux" />
                    <span className="text-sm font-medium">Publiée</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCollectionModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-bordeaux text-white rounded hover:bg-bordeaux/90 disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Matiere Modal */}
      {isMatiereModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingMatiere?.id ? 'Modifier la Matière' : 'Nouvelle Matière'}</h3>
              <button onClick={() => setIsMatiereModalOpen(false)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveMatiere} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la matière</label>
                <input required type="text" value={editingMatiere?.nom || ''} onChange={e => setEditingMatiere({...editingMatiere, nom: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsMatiereModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-bordeaux text-white rounded hover:bg-bordeaux/90 disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ouvrage Modal */}
      {isOuvrageModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingOuvrage?.id ? 'Modifier l\'Ouvrage' : 'Nouvel Ouvrage'}</h3>
              <button onClick={() => setIsOuvrageModalOpen(false)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveOuvrage} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titre *</label>
                  <input required type="text" value={editingOuvrage?.titre || ''} onChange={e => setEditingOuvrage({...editingOuvrage, titre: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Auteur *</label>
                  <input required type="text" value={editingOuvrage?.auteur || ''} onChange={e => setEditingOuvrage({...editingOuvrage, auteur: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Collection</label>
                  <select value={editingOuvrage?.collection_id || ''} onChange={e => setEditingOuvrage({...editingOuvrage, collection_id: e.target.value})} className="w-full p-2 border rounded bg-white">
                    <option value="">-- Sans collection --</option>
                    {collections.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Matière</label>
                  <select value={editingOuvrage?.matiere || ''} onChange={e => setEditingOuvrage({...editingOuvrage, matiere: e.target.value})} className="w-full p-2 border rounded bg-white">
                    <option value="">-- Sans matière --</option>
                    {matieres.map(m => <option key={m.id} value={m.nom}>{m.nom}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Niveau</label>
                  <input type="text" value={editingOuvrage?.niveau || ''} onChange={e => setEditingOuvrage({...editingOuvrage, niveau: e.target.value})} className="w-full p-2 border rounded" placeholder="ex: Terminale" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prix (FCFA) *</label>
                  <input required type="number" min="0" step="0.01" value={editingOuvrage?.prix || 0} onChange={e => setEditingOuvrage({...editingOuvrage, prix: parseFloat(e.target.value)})} className="w-full p-2 border rounded" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer mb-2 block">
                    <input type="checkbox" checked={editingOuvrage?.disponibilite ?? true} onChange={e => setEditingOuvrage({...editingOuvrage, disponibilite: e.target.checked})} className="rounded text-bordeaux focus:ring-bordeaux" />
                    <span className="text-sm font-medium">Disponible (En stock)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer block">
                    <input type="checkbox" checked={editingOuvrage?.afficher_prix ?? true} onChange={e => setEditingOuvrage({...editingOuvrage, afficher_prix: e.target.checked})} className="rounded text-bordeaux focus:ring-bordeaux" />
                    <span className="text-sm font-medium">Afficher le prix</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={editingOuvrage?.description || ''} onChange={e => setEditingOuvrage({...editingOuvrage, description: e.target.value})} className="w-full p-2 border rounded" rows={4} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block font-medium mb-2 flex items-center gap-2"><ImageIcon size={18} /> Image de couverture</label>
                  {editingOuvrage?.couverture_url && !coverFile && (
                    <div className="mb-2 text-sm text-green-600">✓ Image actuelle sauvegardée</div>
                  )}
                  <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block font-medium mb-2 flex items-center gap-2"><BookText size={18} /> Fichier extrait (PDF)</label>
                  {editingOuvrage?.extrait_url && !extractFile && (
                    <div className="mb-2 text-sm text-green-600">✓ Extrait actuel sauvegardé</div>
                  )}
                  <input type="file" accept="application/pdf" onChange={e => setExtractFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsOuvrageModalOpen(false)} className="px-6 py-2 border rounded hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-bordeaux text-white rounded hover:bg-bordeaux/90 disabled:opacity-50 flex items-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Partenaire Modal */}
      {isPartenaireModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingPartenaire?.id ? 'Modifier le Partenaire' : 'Nouveau Partenaire'}</h3>
              <button onClick={() => setIsPartenaireModalOpen(false)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
            </div>
            <form onSubmit={handleSavePartenaire} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de l'établissement *</label>
                <input required type="text" value={editingPartenaire?.nom || ''} onChange={e => setEditingPartenaire({...editingPartenaire, nom: e.target.value})} className="w-full p-2 border rounded" placeholder="ex: Librairie de France" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adresse (Localisation)</label>
                <textarea value={editingPartenaire?.adresse || ''} onChange={e => setEditingPartenaire({...editingPartenaire, adresse: e.target.value})} className="w-full p-2 border rounded" rows={3} placeholder="ex: Abidjan, Plateau..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact</label>
                <input type="text" value={editingPartenaire?.contact || ''} onChange={e => setEditingPartenaire({...editingPartenaire, contact: e.target.value})} className="w-full p-2 border rounded" placeholder="ex: +225 0102030405" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPartenaireModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-bordeaux text-white rounded hover:bg-bordeaux/90 disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ressource Modal */}
      {isRessourceModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-anthracite">
                {editingRessource?.id ? 'Modifier la Ressource' : 'Nouvelle Ressource Pédagogique'}
              </h3>
              <button onClick={() => setIsRessourceModalOpen(false)} className="text-gray-400 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveRessource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre de la ressource *</label>
                <input 
                  required 
                  type="text" 
                  value={editingRessource?.titre || ''} 
                  onChange={e => setEditingRessource({...editingRessource, titre: e.target.value})} 
                  className="w-full p-2 border rounded" 
                  placeholder="ex: Fiche d'exercices - Les Fonctions numériques" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type de ressource *</label>
                  <select 
                    required 
                    value={editingRessource?.type || 'Fiche de cours'} 
                    onChange={e => setEditingRessource({...editingRessource, type: e.target.value})} 
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="Fiche de cours">Fiche de cours</option>
                    <option value="Corrigé">Corrigé</option>
                    <option value="Exercices">Exercices</option>
                    <option value="Guide pédagogique">Guide pédagogique</option>
                    <option value="Extrait">Extrait</option>
                    <option value="Document complémentaire">Document complémentaire</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Format du document</label>
                  <select 
                    value={editingRessource?.format || 'PDF'} 
                    onChange={e => setEditingRessource({...editingRessource, format: e.target.value})} 
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Word">Word (.docx)</option>
                    <option value="Excel">Excel (.xlsx)</option>
                    <option value="PowerPoint">PowerPoint (.pptx)</option>
                    <option value="Audio">Audio (MP3)</option>
                    <option value="Vidéo">Vidéo</option>
                    <option value="Lien">Lien externe</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Matière</label>
                  <select 
                    value={editingRessource?.matiere || ''} 
                    onChange={e => setEditingRessource({...editingRessource, matiere: e.target.value})} 
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="">-- Sans matière --</option>
                    {matieres.map(m => (
                      <option key={m.id} value={m.nom}>{m.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Niveau scolaire</label>
                  <input 
                    type="text" 
                    value={editingRessource?.niveau || ''} 
                    onChange={e => setEditingRessource({...editingRessource, niveau: e.target.value})} 
                    className="w-full p-2 border rounded" 
                    placeholder="ex: 6ème, 3ème, Terminale, etc." 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ouvrage lié (optionnel)</label>
                  <select 
                    value={editingRessource?.ouvrage_id || ''} 
                    onChange={e => setEditingRessource({...editingRessource, ouvrage_id: e.target.value})} 
                    className="w-full p-2 border rounded bg-white text-sm"
                  >
                    <option value="">-- Aucun ouvrage lié --</option>
                    {ouvrages.map(o => (
                      <option key={o.id} value={o.id}>{o.titre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Collection liée (optionnel)</label>
                  <select 
                    value={editingRessource?.collection_id || ''} 
                    onChange={e => setEditingRessource({...editingRessource, collection_id: e.target.value})} 
                    className="w-full p-2 border rounded bg-white text-sm"
                  >
                    <option value="">-- Aucune collection liée --</option>
                    {collections.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                <h4 className="font-semibold text-sm text-anthracite">Fichier ou Lien d'accès *</h4>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Option A : Téléverser un fichier directement (PDF, Word, etc.)
                  </label>
                  <input 
                    type="file" 
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setRessourceFile(e.target.files[0]);
                      }
                    }} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-bordeaux/10 file:text-bordeaux hover:file:bg-bordeaux/20"
                  />
                  {ressourceFile && (
                    <p className="text-xs text-green-600 mt-1">Fichier sélectionné : {ressourceFile.name}</p>
                  )}
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">OU</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Option B : Lien externe (Google Drive, Dropbox, OneDrive, etc.)
                  </label>
                  <input 
                    type="url" 
                    value={editingRessource?.google_drive_url || ''} 
                    onChange={e => setEditingRessource({...editingRessource, google_drive_url: e.target.value})} 
                    className="w-full p-2 border rounded text-sm bg-white" 
                    placeholder="https://drive.google.com/file/d/... ou https://..." 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si vous utilisez Google Drive, assurez-vous que le lien est en accès public (« Tous les utilisateurs disposant du lien »).
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingRessource?.publie ?? true} 
                    onChange={e => setEditingRessource({...editingRessource, publie: e.target.checked})} 
                    className="rounded text-bordeaux focus:ring-bordeaux" 
                  />
                  <span className="text-sm font-medium text-gray-700">Publier cette ressource immédiatement sur le site</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsRessourceModalOpen(false)} 
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-6 py-2 bg-bordeaux text-white rounded hover:bg-bordeaux/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
