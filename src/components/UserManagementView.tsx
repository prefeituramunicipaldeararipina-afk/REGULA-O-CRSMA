import React, { useState } from 'react';
import { Usuario, PerfilUsuario } from '../types';
import { TODAS_ESFS } from '../data/constants';
import { 
  Users, UserPlus, Shield, ShieldCheck, User, Search, Filter, 
  CheckCircle, XCircle, Edit3, Trash2, Key, Check, AlertCircle, Building, Mail,
  Eye, EyeOff, RefreshCw, CheckCircle2, Download
} from 'lucide-react';

interface UserManagementViewProps {
  usuarios: Usuario[];
  onAddUsuario: (usuario: Omit<Usuario, 'id' | 'criadoEm'>) => void;
  onUpdateUsuario: (usuario: Usuario) => void;
  onDeleteUsuario: (id: string) => void;
  perfilUsuario: PerfilUsuario;
  setPerfilUsuario: (perfil: PerfilUsuario) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  usuarios,
  onAddUsuario,
  onUpdateUsuario,
  onDeleteUsuario,
  perfilUsuario,
  setPerfilUsuario,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPerfil, setFilterPerfil] = useState<PerfilUsuario | 'TODOS'>('TODOS');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  // Password visibility & reset modal states
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordModalUser, setResetPasswordModalUser] = useState<Usuario | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('123456');
  const [showResetPasswordSuccess, setShowResetPasswordSuccess] = useState<string | null>(null);

  // Permission check: Both Administrador and Regulador can manage users and passwords
  const canManageUsers = perfilUsuario === 'ADMINISTRADOR' || perfilUsuario === 'REGULADOR';

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cnesUnidade: '',
    unidadeOuOrgao: 'eSF Alto da Boa Vista I',
    perfil: 'SOLICITANTE' as PerfilUsuario,
    ativo: true,
    senha: '',
  });

  const handleOpenAddModal = () => {
    setFormData({
      nome: '',
      email: '',
      cnesUnidade: '',
      unidadeOuOrgao: 'eSF Alto da Boa Vista I',
      perfil: 'SOLICITANTE',
      ativo: true,
      senha: '123456',
    });
    setEditingUser(null);
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      cnesUnidade: user.cnesUnidade || user.cpfOuCnes || '',
      unidadeOuOrgao: user.unidadeOuOrgao,
      perfil: user.perfil,
      ativo: user.ativo,
      senha: user.senha || '',
    });
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleOpenResetPasswordModal = (user: Usuario) => {
    setResetPasswordModalUser(user);
    setNewPasswordInput(user.senha || '123456');
    setShowPassword(false);
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordModalUser) return;

    const finalSenha = newPasswordInput.trim() || '123456';
    onUpdateUsuario({
      ...resetPasswordModalUser,
      senha: finalSenha,
    });

    setShowResetPasswordSuccess(`Senha do usuário "${resetPasswordModalUser.nome}" redefinida com sucesso para: "${finalSenha}"`);
    setResetPasswordModalUser(null);

    setTimeout(() => {
      setShowResetPasswordSuccess(null);
    }, 6000);
  };

  const handleGenerateRandomPassword = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setNewPasswordInput(randomPin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.cnesUnidade.trim()) return;

    const autoEmail = formData.email.trim() || `${formData.cnesUnidade.trim()}@araripina.pe.gov.br`;

    const payload = {
      ...formData,
      email: autoEmail,
      cpfOuCnes: formData.cnesUnidade, // maintain backwards compatibility
      senha: formData.senha.trim() || '123456',
    };

    if (editingUser) {
      onUpdateUsuario({
        ...editingUser,
        ...payload,
      });
    } else {
      onAddUsuario(payload);
    }
    setIsAddModalOpen(false);
  };

  // Filtered Users
  const filteredUsers = usuarios.filter((u) => {
    const matchesSearch = 
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.unidadeOuOrgao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.cnesUnidade && u.cnesUnidade.includes(searchTerm)) ||
      (u.cpfOuCnes && u.cpfOuCnes.includes(searchTerm));

    const matchesPerfil = filterPerfil === 'TODOS' || u.perfil === filterPerfil;
    return matchesSearch && matchesPerfil;
  });

  const totalSolicitantes = usuarios.filter((u) => u.perfil === 'SOLICITANTE').length;
  const totalReguladores = usuarios.filter((u) => u.perfil === 'REGULADOR').length;
  const totalAdministradores = usuarios.filter((u) => u.perfil === 'ADMINISTRADOR').length;

  return (
    <div className="space-y-6">
      {/* Success Notification Banner for Password Reset */}
      {showResetPasswordSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{showResetPasswordSuccess}</span>
          </div>
          <button
            onClick={() => setShowResetPasswordSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/30 border border-purple-500/40 rounded-xl text-purple-300">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Gestão de Usuários e Controle de Acessos
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Administração de perfis da rede de saúde municipal: Solicitantes (eSFs), Reguladores (CRSMA) e Administradores.
            </p>
          </div>
        </div>

        {canManageUsers ? (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/projeto_crsma.zip"
              download="projeto_crsma.zip"
              className="px-4 py-2 bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-200 hover:text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              title="Download do arquivo ZIP com o código-fonte completo do sistema"
            >
              <Download className="w-4 h-4 text-purple-300" />
              <span>Baixar ZIP do Código</span>
            </a>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Usuário</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPerfilUsuario('REGULADOR')}
              className="px-3 py-2 bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600 text-emerald-200 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              title="Ativar perfil regulador para gerenciar usuários"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ativar Regulador</span>
            </button>
            <button
              onClick={() => setPerfilUsuario('ADMINISTRADOR')}
              className="px-3 py-2 bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600 text-purple-200 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              title="Ativar perfil administrador para gerenciar usuários"
            >
              <Shield className="w-4 h-4" />
              <span>Ativar Administrador</span>
            </button>
          </div>
        )}
      </div>

      {/* Access Restriction Alert if not Admin or Regulador */}
      {!canManageUsers && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-950">
              Modo de Visualização do Controle de Acesso ({perfilUsuario})
            </h4>
            <p className="text-xs text-amber-800">
              Você está navegando com o perfil <strong>{perfilUsuario}</strong>. A criação de usuários e a redefinição de senhas são permitidas para os perfis <strong>ADMINISTRADOR</strong> e <strong>REGULADOR</strong>. Clique nos botões acima para alternar o perfil de acesso se desejar cadastrar usuários ou redefinir senhas.
            </p>
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cadastrados</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{usuarios.length}</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Perfil Solicitante (eSF)</span>
            <div className="text-2xl font-black text-blue-900 mt-1">{totalSolicitantes}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Perfil Regulador (CRSMA)</span>
            <div className="text-2xl font-black text-emerald-900 mt-1">{totalReguladores}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Perfil Administrador</span>
            <div className="text-2xl font-black text-purple-900 mt-1">{totalAdministradores}</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-700">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, eSF ou CNES..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
          />
        </div>

        {/* Profile Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterPerfil('TODOS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterPerfil === 'TODOS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({usuarios.length})
          </button>
          <button
            onClick={() => setFilterPerfil('SOLICITANTE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterPerfil === 'SOLICITANTE' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            Solicitantes ({totalSolicitantes})
          </button>
          <button
            onClick={() => setFilterPerfil('REGULADOR')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterPerfil === 'REGULADOR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Reguladores ({totalReguladores})
          </button>
          <button
            onClick={() => setFilterPerfil('ADMINISTRADOR')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterPerfil === 'ADMINISTRADOR' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            Administradores ({totalAdministradores})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="px-4 py-3">Coordenador / Usuário</th>
                <th className="px-4 py-3">E-mail / Acesso</th>
                <th className="px-4 py-3">Unidade / Órgão</th>
                <th className="px-4 py-3">Perfil de Acesso</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User Info */}
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 ${
                          user.perfil === 'ADMINISTRADOR' ? 'bg-purple-600' :
                          user.perfil === 'REGULADOR' ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}>
                          {user.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.nome}</div>
                          {(user.cnesUnidade || user.cpfOuCnes) && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              CNES: {user.cnesUnidade || user.cpfOuCnes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="px-4 py-3 text-slate-800 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.unidadeOuOrgao}</span>
                      </div>
                    </td>

                    {/* Profile */}
                    <td className="px-4 py-3">
                      {user.perfil === 'ADMINISTRADOR' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                          <Shield className="w-3 h-3" />
                          Administrador
                        </span>
                      )}
                      {user.perfil === 'REGULADOR' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                          <ShieldCheck className="w-3 h-3" />
                          Regulador (CRSMA)
                        </span>
                      )}
                      {user.perfil === 'SOLICITANTE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                          <User className="w-3 h-3" />
                          Solicitante (eSF)
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {user.ativo ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          Inativo
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canManageUsers && (
                          <>
                            {/* Redefinir Senha Button */}
                            <button
                              onClick={() => handleOpenResetPasswordModal(user)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                              title={`Redefinir senha do usuário ${user.nome}`}
                            >
                              <Key className="w-3.5 h-3.5 text-amber-600" />
                              <span>Redefinir Senha</span>
                            </button>

                            {/* Edit User Button */}
                            <button
                              onClick={() => handleOpenEditModal(user)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                              title="Editar Dados do Usuário"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete User Button */}
                            <button
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) {
                                  onDeleteUsuario(user.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Excluir Usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Nenhum usuário encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redefinir Senha Modal */}
      {resetPasswordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-200">
                  <Key className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Redefinir Senha de Acesso
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina uma nova senha para o profissional
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900 text-sm">{resetPasswordModalUser.nome}</div>
              <div className="text-slate-600 font-medium">{resetPasswordModalUser.email}</div>
              <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-1.5 pt-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{resetPasswordModalUser.unidadeOuOrgao}</span>
                <span>&bull;</span>
                <span className="uppercase font-extrabold text-purple-700">{resetPasswordModalUser.perfil}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">Nova Senha de Acesso *</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[10px] text-purple-700 hover:text-purple-900 font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Gerar PIN 6 Dígitos</span>
                  </button>
                </div>

                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite a nova senha"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500">Atalhos de senha:</span>
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput('123456')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] border border-slate-200 cursor-pointer"
                  >
                    123456
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput('crsma2026')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] border border-slate-200 cursor-pointer"
                  >
                    crsma2026
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordModalUser(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 font-bold rounded-lg text-xs text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Redefinição</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingUser ? 'Editar Cadastro de Usuário' : 'Cadastrar Novo Usuário'}
                  </h3>
                  <p className="text-xs text-slate-500">Defina os dados, senha e perfil de acesso no sistema municipal</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Coordenador da Unidade *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Enf. Maria Souza (Coordenador)"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Código CNES da Unidade *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 230206 ou 100001"
                  value={formData.cnesUnidade}
                  onChange={(e) => setFormData({ ...formData, cnesUnidade: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
                />
              </div>

              {/* Senha de Acesso Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">Senha de Acesso do Usuário *</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, senha: '123456' })}
                    className="text-[10px] text-purple-700 hover:text-purple-900 font-bold cursor-pointer"
                  >
                    Usar senha padrão (123456)
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite a senha de acesso (padrão: 123456)"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full pl-9 pr-10 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Senha utilizada pela unidade/profissional para realizar o login no sistema.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Unidade de Saúde ou Órgão *</label>
                <select
                  required
                  value={formData.unidadeOuOrgao}
                  onChange={(e) => setFormData({ ...formData, unidadeOuOrgao: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden bg-white"
                >
                  <option value="" disabled>Selecione a Unidade de Saúde...</option>
                  <optgroup label="Secretaria / Gestão Central">
                    <option value="Secretaria Municipal de Saúde">Secretaria Municipal de Saúde</option>
                    <option value="CRSMA - Regulação Central">CRSMA - Regulação Central</option>
                  </optgroup>
                  <optgroup label="Unidades Básicas de Saúde (32 eSFs)">
                    {TODAS_ESFS.filter((u) => u !== 'Secretaria Municipal de Saúde').map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Perfil Selection Box */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Perfil de Acesso & Permissões *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    formData.perfil === 'SOLICITANTE'
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="perfilOption"
                      value="SOLICITANTE"
                      checked={formData.perfil === 'SOLICITANTE'}
                      onChange={() => setFormData({ ...formData, perfil: 'SOLICITANTE' })}
                      className="sr-only"
                    />
                    <div className="font-extrabold text-xs flex items-center gap-1.5 text-blue-900">
                      <User className="w-3.5 h-3.5" />
                      <span>Solicitante</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Apenas cria solicitações e visualiza a Fila de Regulação da sua unidade</p>
                  </label>

                  <label className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    formData.perfil === 'REGULADOR'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="perfilOption"
                      value="REGULADOR"
                      checked={formData.perfil === 'REGULADOR'}
                      onChange={() => setFormData({ ...formData, perfil: 'REGULADOR' })}
                      className="sr-only"
                    />
                    <div className="font-extrabold text-xs flex items-center gap-1.5 text-emerald-900">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Regulador</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Aprova solicitações, gerencia a Fila de Regulação e vagas</p>
                  </label>

                  <label className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    formData.perfil === 'ADMINISTRADOR'
                      ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500 text-purple-900'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="perfilOption"
                      value="ADMINISTRADOR"
                      checked={formData.perfil === 'ADMINISTRADOR'}
                      onChange={() => setFormData({ ...formData, perfil: 'ADMINISTRADOR' })}
                      className="sr-only"
                    />
                    <div className="font-extrabold text-xs flex items-center gap-1.5 text-purple-900">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Administrador</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Gestão total do sistema, Fila de Regulação, configurações e cadastro de usuários</p>
                  </label>
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">Status do Usuário</span>
                  <p className="text-[10px] text-slate-500">Usuários inativos não conseguem acessar o sistema</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, ativo: !formData.ativo })}
                  className={`px-3 py-1 rounded-full font-bold text-xs transition-colors cursor-pointer ${
                    formData.ativo ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {formData.ativo ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 font-bold rounded-lg text-xs text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

