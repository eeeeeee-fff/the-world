export const talentSubscriptions = [
  {
    id: 'li-huachang',
    name: '\u674e\u534e\u7545',
    org: '\u6c5f\u897f\u8d22\u7ecf\u5927\u5b66',
    title: '\u591a\u6444\u50cf\u5934\u878d\u5408\u611f\u77e5',
    location: '\u5357\u660c',
    heat: 96,
    summary: '\u8fd1\u671f\u4e13\u5229\u516c\u5f00\u548c\u5408\u4f5c\u4f5c\u8005\u8054\u52a8\u5bc6\u5ea6\u660e\u663e\u4e0a\u5347\uff0c\u9002\u5408\u4f5c\u4e3a\u91cd\u70b9\u8ba2\u9605\u5bf9\u8c61\u3002',
    tags: ['\u591a\u6444\u50cf\u5934', '\u878d\u5408\u663e\u793a', '\u5934\u6234\u8bbe\u5907'],
    collaborators: [
      { name: '\u674e\u6118\u6602', org: '\u6c5f\u897f\u8d22\u7ecf\u5927\u5b66', relation: '\u5171\u540c\u53d1\u660e', strength: '\u9ad8\u9891\u5408\u4f5c' },
      { name: '\u767d\u8000\u8f89', org: '\u6c5f\u897f\u8d22\u7ecf\u5927\u5b66', relation: '\u5171\u540c\u53d1\u660e', strength: '\u7a33\u5b9a\u5408\u4f5c' },
      { name: '\u5f20\u840d', org: '\u6b66\u6c49\u7406\u5de5\u5927\u5b66', relation: '\u8de8\u6821\u5408\u4f5c', strength: '\u65b0\u589e\u8fde\u63a5' }
    ],
    graphNodes: [
      { id: 'core', label: '\u674e\u534e\u7545', x: 50, y: 46, tone: 'core' },
      { id: 'liyuang', label: '\u674e\u6118\u6602', x: 22, y: 34, tone: 'warm' },
      { id: 'zhangping', label: '\u5f20\u840d', x: 74, y: 58, tone: 'warm' },
      { id: 'baiyaohui', label: '\u767d\u8000\u8f89', x: 38, y: 70, tone: 'cool' }
    ],
    graphLinks: [
      { from: 'core', to: 'liyuang', label: '\u8054\u5408\u7533\u8bf7' },
      { from: 'core', to: 'zhangping', label: '\u8de8\u6821\u5408\u4f5c' },
      { from: 'core', to: 'baiyaohui', label: '\u5171\u540c\u4f5c\u8005' }
    ],
    directions: [
      { name: '\u878d\u5408\u663e\u793a\u4f18\u5316', value: 88, delta: '+12%' },
      { name: '\u5934\u6234\u5f0f\u6210\u50cf', value: 82, delta: '+9%' },
      { name: '\u591a\u6444\u50cf\u5934\u6807\u5b9a', value: 76, delta: '+6%' },
      { name: '\u89c6\u89c9\u8d28\u91cf\u8bc4\u6d4b', value: 68, delta: '+4%' }
    ],
    trend: {
      months: ['4\u6708', '5\u6708', '6\u6708', '7\u6708', '8\u6708', '9\u6708'],
      values: [22, 31, 46, 58, 71, 86]
    },
    feed: [
      {
        type: '\u53d1\u660e\u4e13\u5229',
        title: '\u4e00\u79cd\u591a\u6444\u50cf\u5934\u878d\u5408\u611f\u77e5\u7684\u56fe\u50cf\u663e\u793a\u65b9\u6cd5\u53ca\u7cfb\u7edf',
        date: '2025-08-29',
        score: '+15',
        authors: ['\u674e\u534e\u7545', '\u5f90\u610f\u84ec', '\u674e\u6118\u6602'],
        abstract: '\u56f4\u7ed5\u591a\u6444\u50cf\u5934\u878d\u5408\u663e\u793a\u94fe\u8def\uff0c\u91cd\u70b9\u4f18\u5316\u76ee\u6807\u663e\u793a\u8bbe\u5907\u7684\u4f7f\u7528\u8bb0\u5f55\u4e0e\u753b\u9762\u8c03\u4f18\u903b\u8f91\u3002',
        keywords: ['\u5173\u8054\u6570\u636e', '\u878d\u5408\u663e\u793a\u4f18\u5316', '\u76ee\u6807\u8bbe\u5907\u8bb0\u5f55']
      },
      {
        type: '\u53d1\u660e\u4e13\u5229',
        title: '\u4e00\u79cd\u7528\u4e8e\u5934\u6234\u5f0f\u663e\u793a\u8bbe\u5907\u7684\u6210\u50cf\u663e\u793a\u65b9\u6cd5',
        date: '2025-06-17',
        score: '+9',
        authors: ['\u767d\u8000\u8f89', '\u674e\u534e\u7545'],
        abstract: '\u9762\u5411\u5934\u6234\u5f0f\u663e\u793a\u573a\u666f\uff0c\u5efa\u7acb\u663e\u793a\u6a21\u7ec4\u3001\u56fe\u50cf\u8c03\u6574\u548c\u89c6\u89c9\u7a33\u5b9a\u4e4b\u95f4\u7684\u534f\u540c\u673a\u5236\u3002',
        keywords: ['\u663e\u793a\u8d28\u91cf', '\u89c6\u529b\u72b6\u51b5', '\u6210\u50cf\u7a33\u5b9a']
      },
      {
        type: '\u53d1\u660e\u4e13\u5229',
        title: '\u4e00\u79cd\u7528\u4e8e\u5934\u6234\u5f0f\u8bbe\u5907\u7684\u591a\u6444\u50cf\u5934\u6210\u50cf\u65b9\u6cd5',
        date: '2025-06-10',
        score: '+6',
        authors: ['\u674e\u534e\u7545', '\u767d\u8000\u8f89'],
        abstract: '\u5728\u591a\u6444\u50cf\u5934\u6210\u50cf\u8def\u5f84\u4e2d\u52a0\u5165\u65f6\u5e8f\u4e00\u81f4\u6027\u63a7\u5236\uff0c\u589e\u5f3a\u5934\u6234\u8bbe\u5907\u6210\u50cf\u6548\u679c\u3002',
        keywords: ['\u65f6\u5e8f\u4e00\u81f4\u6027', '\u56fe\u50cf\u6570\u636e\u91c7\u96c6', '\u8bbe\u5907\u534f\u540c']
      },
      {
        type: '\u524d\u6cbf\u8bba\u6587',
        title: '\u57fa\u4e8e\u6269\u6563\u6a21\u578b\u548c\u8fde\u7eed\u5e27\u65f6\u9891\u4fe1\u606f\u878d\u5408\u7684\u4eba\u4f53\u59ff\u6001\u4f30\u8ba1',
        date: '2025-02-25',
        score: '+5',
        authors: ['\u674e\u534e\u7545', '\u7ae0\u52c7'],
        abstract: '\u5c06\u6269\u6563\u6a21\u578b\u5f15\u5165\u8fde\u7eed\u5e27\u65f6\u9891\u4fe1\u53f7\u5206\u6790\uff0c\u7528\u4e8e\u590d\u6742\u89c6\u89c9\u573a\u666f\u4e0b\u7684\u4eba\u4f53\u59ff\u6001\u4f30\u8ba1\u3002',
        keywords: ['transformer', '\u4eba\u4f53\u9aa8\u67b6', '\u6269\u6563\u6a21\u578b']
      }
    ]
  },
  {
    id: 'li-jiancheng',
    name: '\u674e\u5efa\u6210',
    org: '\u4e2d\u56fd\u516c\u8def\u5de5\u7a0b\u54a8\u8be2\u96c6\u56e2\u6709\u9650\u516c\u53f8',
    title: '\u9053\u8def\u4ea4\u901a\u76d1\u6d4b',
    location: '\u5317\u4eac',
    heat: 84,
    summary: '\u4e13\u5229\u96c6\u4e2d\u5728\u9053\u8def\u4ea4\u901a\u76d1\u6d4b\u3001\u65f6\u5e8f\u5206\u6790\u548c\u7269\u8054\u7f51\u6570\u636e\u5904\u7406\uff0c\u9002\u5408\u505a\u5de5\u7a0b\u5e94\u7528\u7ebf\u7d22\u8ddf\u8e2a\u3002',
    tags: ['\u9053\u8def\u4ea4\u901a', '\u65f6\u5e8f\u52a8\u6001', '\u7269\u8054\u7f51'],
    collaborators: [
      { name: '\u8d75\u6960', org: '\u4e2d\u4ea4\u96c6\u56e2', relation: '\u9879\u76ee\u534f\u4f5c', strength: '\u5b63\u5ea6\u65b0\u589e' },
      { name: '\u97e9\u62d3', org: '\u4ea4\u901a\u8fd0\u8f93\u90e8\u7814\u7a76\u9662', relation: '\u8bc4\u5ba1\u5408\u4f5c', strength: '\u4e2d\u9891\u5408\u4f5c' }
    ],
    graphNodes: [
      { id: 'core', label: '\u674e\u5efa\u6210', x: 48, y: 48, tone: 'core' },
      { id: 'zhaonan', label: '\u8d75\u6960', x: 70, y: 30, tone: 'warm' },
      { id: 'hantuo', label: '\u97e9\u62d3', x: 28, y: 66, tone: 'cool' }
    ],
    graphLinks: [
      { from: 'core', to: 'zhaonan', label: '\u9879\u76ee\u534f\u4f5c' },
      { from: 'core', to: 'hantuo', label: '\u8054\u5408\u8bc4\u5ba1' }
    ],
    directions: [
      { name: '\u9053\u8def\u4ea4\u901a\u6d41\u91cf', value: 81, delta: '+8%' },
      { name: '\u8fb9\u7f18\u611f\u77e5\u7ec8\u7aef', value: 74, delta: '+5%' },
      { name: '\u65f6\u5e8f\u52a8\u6001\u8bc6\u522b', value: 69, delta: '+4%' },
      { name: '\u7269\u8054\u7f51\u5904\u7406', value: 62, delta: '+3%' }
    ],
    trend: {
      months: ['4\u6708', '5\u6708', '6\u6708', '7\u6708', '8\u6708', '9\u6708'],
      values: [18, 24, 33, 41, 55, 63]
    },
    feed: [
      {
        type: '\u53d1\u660e\u4e13\u5229',
        title: '\u4e00\u79cd\u57fa\u4e8e\u7269\u8054\u7f51\u7684\u6570\u636e\u5904\u7406\u65b9\u6cd5\u53ca\u7cfb\u7edf',
        date: '2024-08-09',
        score: '+5',
        authors: ['\u674e\u5efa\u6210', '\u8d75\u6960'],
        abstract: '\u57fa\u4e8e\u4f20\u611f\u5668\u7f51\u7edc\u7684\u7269\u6d41\u548c\u4ea4\u901a\u6570\u636e\u5904\u7406\u65b9\u6cd5\uff0c\u5f3a\u5316\u5b9e\u65f6\u91c7\u96c6\u548c\u72b6\u6001\u5224\u5b9a\u3002',
        keywords: ['\u9053\u8def\u4ea4\u901a\u76d1\u6d4b', '\u65f6\u5e8f\u52a8\u6001', '\u7269\u8054\u7f51']
      }
    ]
  },
  {
    id: 'zhang-yuan',
    name: '\u5f20\u6c85',
    org: '\u4e2d\u56fd\u4eba\u6c11\u5927\u5b66',
    title: '\u653f\u7b56\u5173\u8054\u4e0e\u4eba\u624d\u8bc4\u4f30',
    location: '\u5317\u4eac',
    heat: 73,
    summary: '\u8fd1\u671f\u4ee5\u653f\u7b56\u89e3\u8bfb\u548c\u4eba\u624d\u8bc4\u4f30\u6a21\u578b\u4e3a\u4e3b\uff0c\u9002\u5408\u8865\u5145\u77e5\u8bc6\u56fe\u8c31\u4e2d\u7684\u5224\u65ad\u5c42\u3002',
    tags: ['\u653f\u7b56\u89e3\u8bfb', '\u4eba\u624d\u8bc4\u4f30', '\u9ad8\u6821\u667a\u5e93'],
    collaborators: [],
    graphNodes: [
      { id: 'core', label: '\u5f20\u6c85', x: 50, y: 46, tone: 'core' }
    ],
    graphLinks: [],
    directions: [
      { name: '\u4eba\u624d\u8bc4\u4f30\u6a21\u578b', value: 67, delta: '+5%' },
      { name: '\u9ad8\u6821\u667a\u5e93\u5206\u6790', value: 61, delta: '+3%' }
    ],
    trend: {
      months: ['4\u6708', '5\u6708', '6\u6708', '7\u6708', '8\u6708', '9\u6708'],
      values: [12, 18, 21, 27, 29, 35]
    },
    feed: []
  },
  {
    id: 'li-deyi',
    name: '\u674e\u5fb7\u4e00',
    org: '\u6b66\u6c49\u5927\u5b66',
    title: '\u7a7a\u95f4\u6d4b\u7ed8\u4e0e\u56fe\u50cf\u8ba1\u7b97',
    location: '\u6b66\u6c49',
    heat: 69,
    summary: '\u9002\u5408\u548c\u674e\u534e\u7545\u7684\u89c6\u89c9\u65b9\u5411\u5f62\u6210\u6a2a\u5411\u5bf9\u7167\uff0c\u8865\u8db3\u7a7a\u95f4\u6d4b\u7ed8\u548c\u56fe\u50cf\u8ba1\u7b97\u89c6\u89d2\u3002',
    tags: ['\u7a7a\u95f4\u6d4b\u7ed8', '\u56fe\u50cf\u8ba1\u7b97', '\u5730\u7406\u4fe1\u606f'],
    collaborators: [],
    graphNodes: [
      { id: 'core', label: '\u674e\u5fb7\u4e00', x: 50, y: 46, tone: 'core' }
    ],
    graphLinks: [],
    directions: [
      { name: '\u7a7a\u95f4\u6d4b\u7ed8', value: 59, delta: '+2%' },
      { name: '\u56fe\u50cf\u8ba1\u7b97', value: 55, delta: '+2%' }
    ],
    trend: {
      months: ['4\u6708', '5\u6708', '6\u6708', '7\u6708', '8\u6708', '9\u6708'],
      values: [10, 12, 17, 22, 26, 31]
    },
    feed: []
  }
]
