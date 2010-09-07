
require.paths.unshift('spec', '/usr/local/lib/ruby/gems/1.8/gems/jspec-4.3.3/lib', 'lib')
require('jspec')
require('unit/spec.helper')
require('yourlib')

JSpec
  .exec('spec/unit/spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report()
