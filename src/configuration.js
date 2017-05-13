import React, { Component } from 'react'
import { flatten, flattenDeep, keys, reject, some, uniq, values } from 'lodash'
import classNames from 'classnames'
import data from '../marvel.json'
import './configuration.css'

const Option = ({ name, className, value, children, checked, onChange }) => (
  <li className={classNames(className)}>
    <label>
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span>{children}</span>
    </label>
  </li>
)

class OptionList extends Component {
  constructor(props) {
    super(props)
    this.selectAllChanged = this.selectAllChanged.bind(this)
    this.changed = this.changed.bind(this)
  }

  render() {
    const { title, name, options, selected, children } = this.props
    const allSelected = !selected || selected.length === options.length
    return (
      <section className="option-list">
        <h3>{title}</h3>
        <ul>
          <Option
            name={name}
            className="all"
            value="_all"
            checked={allSelected}
            onChange={this.selectAllChanged}
          >
            All
          </Option>
          {children}
          {options.map(option => this.option(option))}
        </ul>
      </section>
    )
  }

  option(option) {
    const { name, options, selected } = this.props
    const isSelected = selected && selected.indexOf(option) > -1
    const allSelected = !selected || selected.length === options.length
    return (
      <Option
        key={option}
        name={name}
        value={option}
        checked={isSelected || allSelected}
        onChange={this.changed}
      >
        {option}
      </Option>
    )
  }

  selectAllChanged(e) {
    this.props.onChange(e.target.checked ? undefined : [])
  }

  changed(e) {
    const { selected, options, onChange } = this.props
    const { checked, value } = e.target
    if (checked) {
      onChange([...selected, value])
    } else {
      onChange(reject(selected || options, option => option === value))
    }
  }
}

export default class Configuration extends Component {
  render() {
    return (
      <aside className="configuration">
        <div className="options">
          {this.optionList('films', 'Films')}
          {this.optionList('actors', 'Actors')}
          {this.optionList('characters', 'Characters', this.actualHeroes())}
        </div>
      </aside>
    )
  }

  optionList(name, title, children) {
    const { configuration } = this.props

    return (
      <OptionList
        title={title}
        name={name}
        options={this[name]()}
        selected={configuration[name]}
        onChange={this.changed(name)}
      >
        {children}
      </OptionList>
    )
  }

  films() {
    return uniq(
      flatten(data.map(({ appearances }) => keys(appearances)))
    ).sort()
  }

  actors() {
    return uniq(
      flattenDeep(data.map(({ appearances }) => values(appearances).map(keys)))
    ).sort()
  }

  characters() {
    return uniq(data.map(({ name }) => name)).sort()
  }

  heroes() {
    return data.filter(({ appearances }) =>
      some(values(appearances), film =>
        some(values(film), ({ hero }) => hero)))
  }

  actualHeroes() {
    const { configuration: { characters: selection } } = this.props
    const heroes = this.heroes().map(({ name }) => name)
    const anyMinorsSelected = !selection || some(selection, name => heroes.indexOf(name) < 0)

    return (
      <Option
        name={name}
        className="all"
        value="_heroes"
        checked={(selection && selection.length && !anyMinorsSelected) || false}
        onChange={e => this.selectActualHeroes(e.target.checked)}
      >
        “Real” heroes
      </Option>
    )
  }

  selectActualHeroes(select) {
    this.changed('characters')(
      select ? this.heroes().map(({ name }) => name) : this.characters()
    )
  }

  changed(name) {
    const { onChange, configuration } = this.props
    return selection => onChange({ ...configuration, [name]: selection })
  }
}
