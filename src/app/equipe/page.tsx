"use client";

import Image from "next/image";
import { Users } from "lucide-react";
import staffData from "@/data/staff.json";

// Função helper para gerar URLs dos avatares
function getMinecraftAvatar(username: string): string {
  return `https://minotar.net/helm/${username}/128`;
}

function getDiscordAvatar(userId: string, hash: string): string {
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${hash.startsWith('a_') ? 'gif' : 'png'}`;
}

export default function EquipePage() {
  return (
    <>
      <section className="section">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-sky/10 mb-4">
              <Users className="w-8 h-8 text-brand-sky" aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Nossa <span className="text-brand-sky">Equipe</span>
            </h1>
            <p className="text-lg text-gray-600">
              Conheça nosso time de staff
            </p>
          </div>

          {/* Roles Grid - Cards lado a lado */}
          <div className="flex flex-wrap gap-4">
            {staffData.roles.map((role) => (
              <div key={role.id} className="card flex-1 min-w-[280px]">
                {/* Role Header */}
                <div 
                  className="p-4 rounded-t-lg flex items-center gap-2"
                  style={{ 
                    backgroundColor: `${role.color}15`,
                    borderBottom: `2px solid ${role.color}`
                  }}
                >
                  <div
                    className="w-6 h-6 flex items-center justify-center"
                    style={{ 
                      fontSize: '20px',
                      filter: `drop-shadow(0 0 3px ${role.color})`
                    }}
                  >
                    {role.id === 'admin' && '👑'}
                    {role.id === 'srmod' && '⭐'}
                    {role.id === 'mod' && '🛡️'}
                    {role.id === 'helper' && '💬'}
                    {role.id === 'artisan' && '🎨'}
                  </div>
                  <div className="flex-1">
                    <h2 
                      className="text-lg font-bold"
                      style={{ color: role.color }}
                    >
                      {role.name}
                    </h2>
                    <p className="text-xs text-gray-600">
                      {role.members.length} {role.members.length === 1 ? "membro" : "membros"}
                    </p>
                  </div>
                </div>

                {/* Members Cards - Estilo moderno */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', padding: '12px', overflowX: 'auto' }}>
                  {role.members.map((member) => {
                    const minecraftAvatar = getMinecraftAvatar(member.minecraft);
                    const discordAvatar = member.discord && member.discordHash 
                      ? getDiscordAvatar(member.discord, member.discordHash)
                      : null;

                    return (
                      <div
                        key={member.id}
                        className="staff-member-card"
                        style={{ 
                          width: '180px',
                          minWidth: '180px',
                          background: 'rgb(30, 33, 48)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '7px 5px 10px rgba(0, 0, 0, 0.333)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                        }}
                      >
                        {/* Header com cor do cargo */}
                        <div style={{ 
                          height: '80px', 
                          backgroundColor: role.color,
                          position: 'relative',
                          padding: '12px'
                        }}>
                          {/* Avatar */}
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px'
                          }}>
                            <Image
                              src={minecraftAvatar}
                              alt={member.name}
                              width={56}
                              height={56}
                              style={{ 
                                imageRendering: "pixelated",
                                borderRadius: '8px',
                                backgroundColor: 'rgb(40, 44, 66)',
                                border: '2px solid rgb(30, 33, 48)'
                              }}
                            />
                          </div>

                          {/* Nome e @ */}
                          <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: '80px',
                            right: '12px'
                          }}>
                            <div style={{
                              backgroundColor: 'rgb(40, 44, 66)',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              marginBottom: '6px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {member.name}
                            </div>
                            <div style={{
                              backgroundColor: 'rgb(40, 44, 66)',
                              color: 'rgb(160, 160, 180)',
                              fontSize: '11px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              @{member.minecraft}
                            </div>
                          </div>
                        </div>

                        {/* Conteúdo */}
                        <div style={{ padding: '16px' }}>
                          {/* Badge do cargo */}
                          <div style={{
                            backgroundColor: 'rgb(40, 44, 66)',
                            borderRadius: '6px',
                            padding: '12px',
                            textAlign: 'center',
                            marginBottom: '12px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}>
                              <span style={{ fontSize: '18px' }}>
                                {role.id === 'admin' && '👑'}
                                {role.id === 'srmod' && '⭐'}
                                {role.id === 'mod' && '🛡️'}
                                {role.id === 'helper' && '💬'}
                                {role.id === 'artisan' && '🎨'}
                              </span>
                              <span style={{
                                color: role.color,
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}>
                                {role.name}
                              </span>
                            </div>
                          </div>

                          {/* Divisor e ícone social */}
                          <div style={{
                            borderTop: '2px solid rgb(40, 44, 66)',
                            paddingTop: '12px',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '12px'
                          }}>
                            {discordAvatar && (
                              <Image
                                src={discordAvatar}
                                alt="Discord"
                                width={28}
                                height={28}
                                style={{
                                  borderRadius: '50%',
                                  border: `2px solid ${role.color}`
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
