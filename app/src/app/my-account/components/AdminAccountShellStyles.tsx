'use client'

export default function AdminAccountShellStyles() {
  return (
    <style jsx global>{`
      .admin-account-shell {
        overflow-x: hidden;
      }

      .admin-account-shell .left,
      .admin-account-shell .right {
        min-width: 0 !important;
      }

      .admin-account-shell .user-infor {
        padding: 16px !important;
        border-radius: 18px !important;
      }

      .admin-account-shell .user-infor .avatar img {
        width: 92px !important;
        height: 92px !important;
        object-fit: cover !important;
      }

      .admin-account-shell .user-infor .name,
      .admin-account-shell .user-infor .heading6 {
        font-size: 14px !important;
        line-height: 1.25 !important;
      }

      .admin-account-shell .user-infor .mail {
        font-size: 12px !important;
        line-height: 1.35 !important;
      }

      .admin-account-shell .menu-tab .item {
        padding: 10px 12px !important;
      }

      .admin-account-shell .menu-tab strong,
      .admin-account-shell .menu-tab .heading6 {
        font-size: 14px !important;
        line-height: 1.25 !important;
      }

      .admin-account-shell .right .heading5 {
        font-size: 22px !important;
        line-height: 1.2 !important;
      }

      .admin-account-shell .right .heading4 {
        font-size: 26px !important;
        line-height: 1.15 !important;
      }

      .admin-account-shell .right .heading6 {
        font-size: 18px !important;
        line-height: 1.25 !important;
      }

      .admin-account-shell .right table {
        max-width: 100%;
      }

      .admin-account-shell .right > .tab,
      .admin-account-shell .right .tab_address {
        min-width: 0;
      }

      @media (min-width: 1024px) {
        .admin-account-shell .left {
          position: sticky;
          top: 72px;
          align-self: start;
          max-height: calc(100vh - 84px);
          overflow-y: auto;
          scrollbar-width: thin;
        }

        .admin-account-shell .menu-tab {
          padding-bottom: 8px;
        }
      }

      @media (max-width: 1023px) {
        .admin-account-shell {
          padding-top: 12px !important;
        }

        .admin-account-shell .left {
          position: sticky;
          top: 58px;
          z-index: 30;
        }

        .admin-account-shell .user-infor {
          padding: 12px !important;
        }

        .admin-account-shell .user-infor .heading {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 12px !important;
          text-align: left !important;
        }

        .admin-account-shell .user-infor .avatar img {
          width: 58px !important;
          height: 58px !important;
        }

        .admin-account-shell .user-infor .name,
        .admin-account-shell .user-infor .mail {
          text-align: left !important;
        }

        .admin-account-shell .menu-tab {
          margin-top: 12px !important;
          max-height: min(52vh, 460px);
          overflow-y: auto;
          padding-right: 2px;
        }

        .admin-account-shell .right .heading5 {
          font-size: 20px !important;
        }
      }

      @media (max-width: 640px) {
        .admin-account-shell .right .heading5 {
          font-size: 19px !important;
        }

        .admin-account-shell .right .heading4 {
          font-size: 23px !important;
        }

        .admin-account-shell .right .heading6 {
          font-size: 16px !important;
        }
      }
    `}</style>
  )
}
