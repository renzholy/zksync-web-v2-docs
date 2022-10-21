module.exports = {
  title: "zkSync: secure, scalable crypto payments", // adding title gives us a header with search box
  description: "zkSync is a fully trustless user-centric zkRollup protocol for scaling payments and smart contracts on Ethereum.",
  dest: "dist",
  markdown: {
    toc: { includeLevel: [2, 3] },
  },
  extendMarkdown: (md) => {
    // Add support of footnotes (like [^1]) in markdown
    md.use(require("markdown-it-footnote"));
  },
  plugins: [
    [
      "fulltext-search",
      "vuepress-plugin-canonical",
      {
        baseURL: "https://zksync.io", // base url for your canonical link, optional, default: ''
        stripExtension: false, // strip '.html' , optional, default: false
      },
    ],
  ],
  themeConfig: {
    repo: 'matter-labs/zksync-web-v2-docs',
    editLinks: true,
    docsDir: 'docs',
    docsBranch: 'main',
    logo: "/LogotypeLight.svg",
    lastUpdated: "Last Updated",
    nav: [
      // {
      //   text: "User Docs",
      //   link: "/faq/",
      // },
      {
        text: "Developer Docs",
        link: "/dev/",
      },
      {
        text: "Tools/SDKs",
        link: "/api/",
      },
      {
        text: "Contact",
        link: "/contact.html",
      },
      {
        text: 'v2.0',
        items: [
          {
            text: 'v2.0',
            link: '/dev/'
          },
          {
            text: 'v1.x',
            link: 'https://v1-docs.zksync.io'
          }
        ]
      }
    ],
    //displayAllHeaders: true,
    sidebar: {
      "/legal/": ["/legal/terms", "/legal/privacy"],

      "/dev": [
        {
          title: "Overview",
          path: "/dev/",
          collapsable: false, // optional, defaults to true
        },
        {
          title: "Understanding zkSync",
          path: "/dev/fundamentals",
          collapsable: false,
          children: [
            "/dev/fundamentals/rollups.md",
            "/dev/fundamentals/zkSync.md",
            // "/dev/fundamentals/testnet.md",
          ],
        },
        {
          title: "Developer guides",
          path: "/dev/developer-guides",
          collapsable: false,
          children: [
            "/dev/developer-guides/hello-world.md",
            "/dev/developer-guides/contracts/system-contracts.md",
            "/dev/developer-guides/contracts/contracts.md",
            "/dev/developer-guides/contracts/contract-verification.md",
            "/dev/developer-guides/transactions/transactions.md",
            "/dev/developer-guides/transactions/blocks.md",
            "/dev/developer-guides/transactions/aa.md",
            "/dev/developer-guides/bridging/bridging-asset.md",
            "/dev/developer-guides/bridging/l1-l2-interop.md",
            "/dev/developer-guides/bridging/l1-l2.md",
            "/dev/developer-guides/bridging/l2-l1.md",
          ],
        },
        {
          title: "Troubleshooting",
          path: "/dev/troubleshooting",
          collapsable: false,
          children: [
            "/dev/troubleshooting/important-links.md",
            "/dev/troubleshooting/status.md",
            "/dev/troubleshooting/faq/known-issues.md",
            "/dev/docs-contribution/docs.md",
            "/dev/docs-contribution/edit-doc.md",
          ],
        },
        {
          title: "Tutorials",
          path: "/dev/tutorials",
          collapsable: false,
          children: ["/dev/tutorials/cross-chain-tutorial.md", "/dev/tutorials/custom-aa-tutorial.md", "/dev/tutorials/custom-paymaster-tutorial.md"],
        },

      ],
      "/api": [
        {
          title: "Overview", // required
          path: "/api/", // optional, which should be a absolute path.
          collapsable: false, // optional, defaults to true
          sidebarDepth: 0, // optional, defaults to 1
        },
        {
          title: "Web3 API", // required
          path: "/api/api.md", // optional, which should be a absolute path.
          collapsable: false, // optional, defaults to true
          sidebarDepth: 1, // optional, defaults to 1
        },
        {
          title: "L1 contract interface",
          path: "/api/contracts.md",
          collapsable: false, // optional, defaults to true
          sidebarDepth: 1, // optional, defaults to 1
          //children: ["/api/contracts/l1-l2.md"],
        },
        {
          title: "JavaScript SDK", // required
          path: "/api/js", // optional, which should be a absolute path.
          collapsable: false, // optional, defaults to true
          sidebarDepth: 1, // optional, defaults to 1
          children: [
            "/api/js/getting-started",
            "/api/js/providers",
            "/api/js/accounts",
            "/api/js/accounts-l1-l2",
            "/api/js/contracts",
            "/api/js/features",
            "/api/js/utils",
            "/api/js/types",
            "/api/js/front-end",
          ],
        },
        {
          title: "Hardhat", // required
          path: "/api/hardhat", // optional, which should be a absolute path.
          collapsable: false, // optional, defaults to true
          sidebarDepth: 1,
          children: ["/api/hardhat/getting-started", "/api/hardhat/reference", "/api/hardhat/testing", "/api/hardhat/compiling-libraries"],
        },
      ],
    },
    //<! -- OLD STRUTURE -->
    // {
    //   title: "Getting started",
    //   path: "/dev/",
    //   collapsable: false, // optional, defaults to true
    // },
    // {
    //   title: "About the testnet",
    //   path: "/dev/testnet",
    //   collapsable: false,
    //   children: [
    //     "/dev/testnet/user.md",
    //     "/dev/testnet/metamask.md",
    //     "/dev/testnet/important-links.md",
    //     "/dev/testnet/status.md",
    //     "/dev/testnet/known-issues.md",
    //     "/dev/testnet/reporting-issues.md",
    //   ],
    // },
    // {
    //   title: "ZK rollup basics",
    //   path: "/dev/rollups.md",
    //   collapsable: false
    // },
    // {
    //   title: "Understanding zkSync 2.0",
    //   path: "/dev/zksync-v2",
    //   collapsable: false,
    //   children: [
    //     "/dev/zksync-v2/overview.md",
    //     "/dev/zksync-v2/system-contracts.md",
    //     "/dev/zksync-v2/handling-of-eth.md",
    //     "/dev/zksync-v2/fee-model.md",
    //     "/dev/zksync-v2/tx-types.md",
    //     "/dev/zksync-v2/contracts.md",
    //     "/dev/zksync-v2/aa.md",
    //     "/dev/zksync-v2/blocks-and-time.md",
    //     "/dev/zksync-v2/web3.md",
    //     "/dev/zksync-v2/confirmation-and-finality.md",
    //     "/dev/zksync-v2/temp-limits.md",
    //     "/dev/zksync-v2/decentralization-roadmap.md",
    //     "/dev/zksync-v2/l1-l2-interop.md",
    //     "/dev/zksync-v2/bridging-funds.md",
    //   ],
    // },
    // {
    //   title: "Developer guide",
    //   path: "/dev/guide",
    //   collapsable: false,
    //   children: [
    //     "/dev/guide/quickstart.md",
    //     "/dev/guide/hello-world.md",
    //     "/dev/guide/contract-verification.md",
    //     "/dev/guide/solidity-vyper.md",
    //     "/dev/guide/deploying.md",
    //     "/dev/guide/front-end-integration.md",
    //     "/dev/guide/l1-l2.md",
    //     "/dev/guide/l2-l1.md",
    //     "/dev/guide/build-custom-bridge.md",
    //     "/dev/guide/cross-chain-tutorial.md",
    //     "/dev/guide/custom-aa-tutorial.md",
    //     "/dev/guide/custom-paymaster-tutorial.md",
    //     "/dev/guide/migration-to-testnet-paymaster.md"
    //   ],
  },
  // {
  //   title: "Introduction", // required
  //   path: "/dev/", // optional, which should be a absolute path.
  //   collapsable: false, // optional, defaults to true
  // },
  // {
  //   title: "Comparison to v1.0", // required
  //   path: "/dev/v1-vs-v2.md", // optional, which should be a absolute path.
  //   collapsable: false, // optional, defaults to true
  // },
  // {
  //   title: "Comparison to Ethereum", // required
  //   path: "/dev/ethereum-vs-v2.md", // optional, which should be a absolute path.
  //   collapsable: false, // optional, defaults to true
  // },
  // {
  //   title: "Tutorials",
  //   path: "/dev/tutorials",
  //   collapsable: false,
  //   children: ["/dev/tutorials/connecting-to-metamask.md", "/dev/tutorials/bridging-funds.md", "/dev/tutorials/basic.md"],
  // },
  // {
  //   title: "Communicating with L1", // required
  //   path: "/dev/communication-with-l1.md", // optional, which should be a absolute path.
  //   collapsable: false, // optional, defaults to true
  // },
  // {
  //   title: "Troubleshooting",
  //   path: "/dev/troubleshooting.md", // optional, which should be a absolute path.
  // }

  head: [
    ["script", { src: "/__/firebase/7.13.2/firebase-app.js", defer: true }, ""],
    ["script", { src: "/__/firebase/7.13.2/firebase-analytics.js", defer: true }, ""],
    ["script", { src: "/__/firebase/init.js", defer: true }, ""],
    //Hack: Make clicking on the logo go to home url
    [
      "script",
      {},
      `
  const logoUrlChanger = setInterval(function() {
    //Anchor above the logo image
    const homeEls = document.getElementsByClassName("home-link");
    if(homeEls.length > 0) {
      const homeEl = homeEls[0];
      homeEl.setAttribute("href", "https://zksync.io");
      homeEl.setAttribute("onclick", "document.location='https://zksync.io';return false;");
      clearInterval(logoUrlChanger);
    }

    //Actual logo image
    const logoEls = document.getElementsByClassName("logo")
    if(logoEls.length > 0) {
      const logoEl = logoEls[0]
      logoEl.setAttribute("onclick", "document.location='https://zksync.io';return false;");
      clearInterval(logoUrlChanger);
    }
  }, 1000)`,
    ],
  ],
};
